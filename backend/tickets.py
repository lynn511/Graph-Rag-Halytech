from typing import Dict
import uuid
import json
import os
from datetime import datetime

class TicketManager:
    def __init__(self):
        self.tickets_file = "data/tickets.json"
        os.makedirs(os.path.dirname(self.tickets_file), exist_ok=True)
        self.load_tickets()

    def load_tickets(self):
        try:
            with open(self.tickets_file, 'r') as f:
                self.tickets = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.tickets = {}
            self.save_tickets()

    def save_tickets(self):
        with open(self.tickets_file, 'w') as f:
            json.dump(self.tickets, f, indent=2)

    def create_ticket(self, ticket_data: Dict) -> str:
        # Generate a ticket ID with TKT prefix
        ticket_id = f"TKT-{uuid.uuid4().hex[:8].upper()}"
        
        # Add metadata
        ticket_data["ticketId"] = ticket_id
        ticket_data["status"] = "New"
        ticket_data["createdAt"] = datetime.utcnow().isoformat()
        ticket_data["updatedAt"] = ticket_data["createdAt"]
        
        # Store the ticket
        self.tickets[ticket_id] = ticket_data
        self.save_tickets()
        
        return ticket_id

    def get_ticket(self, ticket_id: str) -> Dict:
        return self.tickets.get(ticket_id)