import { addCharacter,getAllCharacter,deleteCharacter,getCharacterById,editCharacterById } from "../controllers/Character.js";
import {getImage} from '../middleware/upload.js';
import { Router } from "express";
import {upload} from "../middleware/upload.js";
import { verifyUser } from "../middleware/Auth.js";

const characterRouter=Router();

characterRouter.get('/',getAllCharacter);
characterRouter.get('/:charId',getCharacterById);
characterRouter.post('/add',upload.single('avatar'),getImage,addCharacter);
characterRouter.delete('/:id',verifyUser,deleteCharacter);
characterRouter.put('/edit/:charId',verifyUser,editCharacterById);



export default characterRouter;
