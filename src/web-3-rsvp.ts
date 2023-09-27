import {
  ConfirmedAttendee as ConfirmedAttendeeEvent,
  DepositsPaidOut as DepositsPaidOutEvent,
  NewEventCreated as NewEventCreatedEvent,
  NewRSVP as NewRSVPEvent
} from "../generated/Web3RSVP/Web3RSVP"
import {
  ConfirmedAttendee,
  DepositsPaidOut,
  NewEventCreated,
  NewRSVP
} from "../generated/schema"

export function handleConfirmedAttendee(event: ConfirmedAttendeeEvent): void {
  let entity = new ConfirmedAttendee(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.eventId = event.params.eventId
  entity.attendeeAddress = event.params.attendeeAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDepositsPaidOut(event: DepositsPaidOutEvent): void {
  let entity = new DepositsPaidOut(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.eventId = event.params.eventId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewEventCreated(event: NewEventCreatedEvent): void {
  let entity = new NewEventCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.eventId = event.params.eventId
  entity.eventDataCID = event.params.eventDataCID
  entity.creatorAddress = event.params.creatorAddress
  entity.eventTimestamp = event.params.eventTimestamp
  entity.deposit = event.params.deposit
  entity.maxCapacity = event.params.maxCapacity

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewRSVP(event: NewRSVPEvent): void {
  let entity = new NewRSVP(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.eventId = event.params.eventId
  entity.attendeeAddress = event.params.attendeeAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
