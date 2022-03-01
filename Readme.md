# Structure

![alt text][structure]

- **Common** - library to share code amongst services
- **NATS Streaming Server** - Event Bus

# Services

- **Auth** - user's signup/signin/signout
  | Route | Methpd | Body | Purpose |
  | ------------- |:-------------:| :-----:| -----:|
  | /api/users/signup | POST | {email: string, password: string} | Sign up for an account
  | /api/users/signin | POST | {email: string, password: string} | Sign in for an existing account
  | /api/users/signout | POST | {} | Sign out
  | /api/users/currentuser | GET | -- | Return info about the user
- **Tickets** - creation/editing
- **Orders** - creation/editing
- **Payments** - handles credit card payments. Cancels orders if payments fails, completes if payment succeeds
- **Expiration** - watches orders, cancel them after 15 minutes

# Events

- **USER**
  - **UserCreated**
  - **UserUpdated**
- **ORDER**
  - **OrderCreated**
  - **OrderCancelled**
  - **OrderExpired**
- **TICKET**
  - **TicketCreated**
  - **TicketUpdated**
- **PAYMENT**
  - **ChargeCreated**

[structure]: ./assets/Screenshot2022-03-01at18.31.48.png 'Structure Image'
