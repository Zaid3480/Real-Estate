
import TicketSupport from '../models/ticket.model.js'; // Import the TicketSupport model


export const getAllTicketsByUserId = async (req, res) => {
    try {
        const userId = req.params.id; // Get the user ID from the request parameters
        const tickets = await TicketSupport.find({ customer: userId }); // Find all tickets for the given user ID

        if (!tickets) {
            return res.status(404).json({ message: 'No tickets found for this user.' });
        }

        return res.status(200).json(tickets); // Return the tickets in the response
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const createTicket = async (req, res) => {
    try {
        const newTicket = new TicketSupport(req.body);
        const savedTicket = await newTicket.save();
        return res.status(201).json(savedTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
