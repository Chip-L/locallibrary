const mongoose = require("mongoose");

const { Schema } = mongoose;

const GenreSchema = new Schema({
  name: { type: String, minlength: 3, maxlength: 100 },
});

// Virtual instance of genre's URL
GenreSchema.virtual("url").get(function () {
  return "/catalog/genre/" + this._id;
});

module.exports = mongoose.model("Genre", GenreSchema);
