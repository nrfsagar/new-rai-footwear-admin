import { Schema, model, models } from "mongoose";

const HeroSchema = new Schema({
  banner_number: {
    type: String,
    required: true,
  },
  image_url: {
    type: String,
    required: true,
  },
});

const Hero = models.Hero || model("Hero", HeroSchema, "heros");

export default Hero;
