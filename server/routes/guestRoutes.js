const express = require('express');
const router = express.Router();
const guestService = require('../services/guestService');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', async (req, res) => {
    try {
        const guest = await guestService.addGuest(req.body, req.user._id);
        res.status(201).json(guest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// IMPORTANT: Specific routes BEFORE parameterized routes
// Get guest invitations by email (for guest login)
router.get('/by-email/:email', async (req, res) => {
    try {
        const guests = await guestService.getGuestByEmail(req.params.email);
        res.json(guests);
    } catch (error) {
        console.error('Error in /by-email route:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get pending RSVP guests for an event
router.get('/pending-rsvp/:eventId', async (req, res) => {
    try {
        const daysBeforeEvent = parseInt(req.query.days) || 7;
        const pendingGuests = await guestService.getPendingRSVPGuests(
            req.params.eventId,
            daysBeforeEvent
        );
        res.json(pendingGuests);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get guests for an event (this must come AFTER specific routes)
router.get('/:eventId', async (req, res) => {
    try {
        const guests = await guestService.getGuests(req.params.eventId, req.user._id);
        res.json(guests);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/:eventId/invite', async (req, res) => {
    try {
        // 1. Add Guest
        const guestData = {
            eventId: req.params.eventId,
            name: req.body.name,
            email: req.body.email
        };
        const newGuest = await guestService.addGuest(guestData, req.user._id);

        // 2. Send Invitation
        await guestService.sendInvitation(newGuest._id, req.user._id, req.body.message);

        res.status(201).json(newGuest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update guest RSVP status
router.put('/:guestId/rsvp', async (req, res) => {
    try {
        const { status } = req.body;
        const guest = await guestService.updateRSVP(req.params.guestId, status);
        res.json({ message: 'RSVP updated successfully', guest });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
