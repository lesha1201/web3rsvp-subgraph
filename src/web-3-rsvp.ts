import { integer } from "@protofire/subgraph-toolkit";
import { Address, ipfs, json } from "@graphprotocol/graph-ts";
import {
  ConfirmedAttendee as ConfirmedAttendeeEvent,
  DepositsPaidOut as DepositsPaidOutEvent,
  NewEventCreated as NewEventCreatedEvent,
  NewRSVP as NewRSVPEvent,
} from "../generated/Web3RSVP/Web3RSVP";
import { Account, Confirmation, Event, RSVP } from "../generated/schema";

/*-- Event handlers --*/

export function handleNewEventCreated(
  contractEvent: NewEventCreatedEvent
): void {
  const eventId = contractEvent.params.eventId.toHex();

  let event = Event.load(eventId);

  if (event != null) {
    return;
  }

  event = new Event(eventId);

  event.eventId = contractEvent.params.eventId;
  event.eventOwner = contractEvent.params.creatorAddress;
  event.eventTimestamp = contractEvent.params.eventTimestamp;
  event.maxCapacity = contractEvent.params.maxCapacity;
  event.deposit = contractEvent.params.deposit;
  event.paidOut = false;
  event.totalRSVPs = integer.ZERO;
  event.totalConfirmedAttendees = integer.ZERO;

  const metadata = ipfs.cat(contractEvent.params.eventDataCID + "/data.json");

  if (metadata) {
    const value = json.fromBytes(metadata).toObject();

    if (value) {
      const name = value.get("name");
      const description = value.get("description");
      const link = value.get("link");
      const imagePath = value.get("image");

      if (name) {
        event.name = name.toString();
      }

      if (description) {
        event.description = description.toString();
      }

      if (link) {
        event.link = link.toString();
      }

      if (imagePath) {
        event.imageUrl =
          "https://ipfs.io/ipfs/" +
          contractEvent.params.eventDataCID +
          imagePath.toString();
      } else {
        event.imageUrl =
          "https://ipfs.io/ipfs/bafybeibssbrlptcefbqfh4vpw2wlmqfj2kgxt3nil4yujxbmdznau3t5wi/event.png";
      }
    }
  }

  event.save();
}

export function handleNewRSVP(event: NewRSVPEvent): void {
  const rsvpId =
    event.params.eventId.toHex() + event.params.attendeeAddress.toHex();

  let rsvp = RSVP.load(rsvpId);

  if (rsvp != null) {
    return;
  }

  const rsvpEvent = Event.load(event.params.eventId.toHex());

  if (rsvpEvent == null) {
    return;
  }

  const account = getOrCreateAccount(event.params.attendeeAddress);

  rsvp = new RSVP(rsvpId);
  rsvp.attendee = account.id;
  rsvp.event = rsvpEvent.id;
  rsvp.save();

  rsvpEvent.totalRSVPs = integer.increment(rsvpEvent.totalRSVPs);
  rsvpEvent.save();

  account.totalRSVPs = integer.increment(account.totalRSVPs);
  account.save();
}

export function handleConfirmedAttendee(event: ConfirmedAttendeeEvent): void {
  const confirmationId =
    event.params.eventId.toHex() + event.params.attendeeAddress.toHex();

  let confirmation = Confirmation.load(confirmationId);

  if (confirmation != null) {
    return;
  }

  const confirmationEvent = Event.load(event.params.eventId.toHex());

  if (confirmationEvent == null) {
    return;
  }

  const account = getOrCreateAccount(event.params.attendeeAddress);

  confirmation = new Confirmation(confirmationId);
  confirmation.attendee = account.id;
  confirmation.event = confirmationEvent.id;
  confirmation.save();

  confirmationEvent.totalConfirmedAttendees = integer.increment(
    confirmationEvent.totalConfirmedAttendees
  );
  confirmationEvent.save();

  account.totalAttendedEvents = integer.increment(account.totalAttendedEvents);
  account.save();
}

export function handleDepositsPaidOut(
  contractEvent: DepositsPaidOutEvent
): void {
  const event = Event.load(contractEvent.params.eventId.toHex());

  if (event == null) {
    return;
  }

  event.paidOut = true;
  event.save();
}

/*-- Utils --*/

function getOrCreateAccount(address: Address): Account {
  const accountId = address.toHex();

  let account = Account.load(accountId);

  if (account == null) {
    account = new Account(accountId);
    account.totalRSVPs = integer.ZERO;
    account.totalAttendedEvents = integer.ZERO;
    account.save();
  }

  return account;
}
