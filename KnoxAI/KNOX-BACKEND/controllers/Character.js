import Character from "../models/character.js";

export const addCharacter = async (req, res) => {
  // Check if body exists
  if (!req.body) {
    return res.status(400).json({ message: "Body required" });
  }

  try {
    const {
      name,
      description,
      personalityPrompt,
      creator,
      category,
      greeting, // Added greeting
      isPublic,
    } = req.body;

    // Validation: greeting is now required for a good user experience
    if (!name || !personalityPrompt || !creator || !greeting) {
      return res.status(400).json({
        message: "Name, greeting, personalityPrompt, and creator are required.",
      });
    }

    let avatar = null;
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }

    const newCharacter = await Character.create({
      name,
      avatar,
      description,
      personalityPrompt,
      creator,
      category,
      greeting, // Save greeting
      isPublic,
    });

    res.status(201).json({ 
      message: "Character Info added Successfully.", 
      character: newCharacter 
    });
  } catch (error) {
    console.error("Error creating character:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllCharacter = async (req, res) => {
  try {
    // Sort by newest first
    const characters = await Character.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Characters fetched successfully",
      count: characters.length,
      characters,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteCharacter = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCharacter = await Character.findByIdAndDelete(id);

    if (!deletedCharacter) {
      return res.status(404).json({ message: "Character Not Found" });
    }

    res.status(200).json({
      message: "Character Deleted Successfully.",
      deleted: deletedCharacter,
    });
  } catch (error) {
    res.status(500).json({ error: "Deletion failed", message: error.message });
  }
};

export const getCharacterById = async (req, res) => {
  try {
    const { charId } = req.params;

    const character = await Character.findById(charId);

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    res.status(200).json({
      message: "Character fetched successfully",
      characters: character, // Kept 'characters' key for frontend compatibility
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const editCharacterById = async (req, res) => {
  try {
    const { charId } = req.params;
    let updateData = { ...req.body };

    // Handle Image Update if a new file is uploaded
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    // Ensure isPublic is treated as a boolean if it comes as a string from FormData
    if (updateData.isPublic !== undefined) {
      updateData.isPublic = updateData.isPublic === "true" || updateData.isPublic === true;
    }

    const updatedCharacter = await Character.findByIdAndUpdate(
      charId,
      { $set: updateData },
      { new: true, runValidators: true } // runValidators ensures schema rules are followed
    );

    if (!updatedCharacter) {
      return res.status(404).json({ message: "Character not found" });
    }

    res.status(200).json({
      message: "Character updated successfully",
      character: updatedCharacter,
    });
  } catch (error) {
    console.error("Error updating character:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};