const { where } = require("sequelize");
const Reservation = require("../Models/Reservation");

// to check if there any table reserved already at the same specific time
// Return a boolean
const isReserved = async(table_id, date, time) => {
    try {
        //filtering reservations to find the table in those specific date and time
        const conflicts = await Reservation.findOne({
            where: {
                table_id,
                date,
                time
            }
        });

        return !!conflicts;
    }
    catch (err) {
        console.error("The checking error : \n",err);
        throw new Error("Error checking for the conflicts");
    }
}

//creating a new reservation after checking for conflicted reservations
//Return response
const newReservation = async(req, res) => {
    const {customer_id, restaurant_id, table_id, date, time} = req.body;
    // checking for availability
    const conflicts = await isReserved(table_id, date, time);
    if (conflicts) {
        return res.status(400).json({error: "This table is unfortunately reserved"});
    }
    // creating the reservation
    try {
        const reservation = await Reservation.create({
            customer_id,
            restaurant_id,
            table_id,
            date,
            time
        })
        return res.status(201).json({message : "The reservation is created successfully!", reservation});
    }
    catch (err) {
        console.error("Creating reservation error : \n",err);
        return res.status(500).json({error: "Error creating the reservation"});
    }
}

// view the reservations that the customer made
//Return json
const viewCustomerReservations = async (req, res) => {
    const {customer_id} = req.body;
    try {
        //filtering the reservations by the customer id
        const reservations = await Reservation.findAll({
            where: {
                customer_id
            }
        })
        if(reservations.length === 0)
            return res.status(404).json({message: "There is no reservations yet"});
        return res.status(200).json({reservations})
    }
    catch (err) {
        console.error("The checking error : \n",err);
        return res.status(500).json({ error: "Error fetching reservations" });
    }
}

//view the reservations of a specific restaurant (vendor pov)
//return json
const viewRestaurantReservations = async (req, res) => {
    const {restaurant_id} = req.body;
    try {
        // filtering the reservations by the restaurant id
        const reservations = await Reservation.findAll({
            where: {
                restaurant_id
            }
        })
        if(reservations.length === 0)
            return res.status(404).json({message: "There is no reservations yet"});
        return res.status(200).json({reservations});
    }
    catch (err) {
        console.error("The checking error : \n",err);
        return res.status(500).json({ error: "Error fetching reservations" });
    }
};

// cancel the reservation (customer pov)
const cancelReservation = async (req, res) => {
    const {reservation_id} = req.body;
    try{
        //delete the reservation from the database
        await Reservation.destroy({
            where: {
                id : reservation_id
            }
        })
        return res.status(200).json({message : "The reservation is cancelled successfully!"});
    }
    catch(err) {
        console.error("The checking error : \n",err);
        return res.status(500).json({ error: "Error cancelling the reservation" });
    }
};

module.exports = {newReservation, viewCustomerReservations, viewRestaurantReservations, cancelReservation};