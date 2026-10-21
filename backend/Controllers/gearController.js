const gearModel = require("../Models/Gear")
const mongoose = require("mongoose")

const getAllGear = async (req, res) => {
    const gears = await gearModel.find({}).sort({createdAt: -1})

    try{
        res.status(200).json({results: gears, mssg: "Successfully Fetched"})
    }catch (err) {
        res.status(400).json({error: err.message})
    }
}

const getGear = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({err: "Invalid ID"})
    }

    const gear = await gearModel.findById(id)

    if(!gear){
        res.status(404).json({mssg: "Could not find gear"})
    }else{
        res.status(200).json(gear)
    }
}

const createGear = async (req, res) => {
 const {name, description, price, 
        category_id, images, isVisible, variations} = req.body
    
    try{
        const gear = await gearModel.create({
            name, description, price, 
            category_id, images, isVisible, variations  
        })
        res.status(200).json({results: gear, mssg: "Successfully Created"})
    }catch (err){
        res.status(400).json({ERROR: err})
    }
}

const deleteGear = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({err: "Invalid ID"})
    }

    const gear = await gearModel.findOneAndDelete({_id: id})

    if(!gear){
        res.status(404).json({mssg: "Could not find gear"})
    }else{
        res.status(200).json(gear)
    }
}

const updateGear = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({err: "Invalid ID"})
    }

    const {name, description, price, category_id, images, isVisible, variations} = req.body

    const gear = await gearModel.findOneAndUpdate({_id: id}, {
         name, description, price, category_id, images, isVisible, variations })

    if(!gear){
        res.status(404).json({mssg: "Could not find gear"})
    }else{
        res.status(200).json(gear)
    }
}

module.exports = {
    createGear,
    getAllGear,
    getGear,
    deleteGear,
    updateGear
}