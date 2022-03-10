# Structure

![alt text][structure]

- **Common** - @yn-projects/common npm library to share code amongst services
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
  | Route | Methpd | Body | Purpose |
  | ------------- |:-------------:| :-----:| -----:|
  | /api/tickets | GET | - | Retrieve all tickets
  | /api/tickets/:id | GET | - | Retrieve specific ticket
  | /api/tickets | POST | {title: string, price: string} | Create a ticket
  | /api/tickets | PUT | {title: string, price: string} | Update a ticket
- **Orders** - creation/editing
  | Route | Methpd | Body | Purpose |
  | ------------- |:-------------:| :-----:| -----:|
  | /api/orders | GET | - | Retrieve all active orders for the given user making the request
  | /api/orders/:id | GET | - | Retrieve details about a specific order
  | /api/orders | POST | {ticketId: string} | Create an order to purchase the specified ticket
  | /api/orders/:id | DELETE | {orderId: string} | Cancel the order
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

[structure]: ./assets/Screenshot2022-03-01at18.31.48.png.png 'Structure Image'
