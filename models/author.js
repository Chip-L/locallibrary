const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const AuthorSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  family_name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  // per tutorial ->
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  // Per me -> I think this is incorrect... not sure how this gets here since both fields are required (which is wrong), if either are missing then an empty string gets returned?
  let full_name = "";

  if (this.first_name && this.family_name) {
    full_name = `${this.family_name}, ${this.first_name}`;
  }

  if (!this.first_name || !this.family_name) {
    full_name = "";
  }
  // console.log(full_name);
  return full_name;
});

// Virtual for author's lifespan
AuthorSchema.virtual("lifespan").get(function () {
  const dob = DateTime.fromJSDate(this.date_of_birth);
  const dod = DateTime.fromJSDate(this.date_of_death);
  let lifetime_string = "";

  if (this.date_of_birth) {
    lifetime_string = dob.year.toString();
  }
  lifetime_string += " - ";
  if (this.date_of_death) {
    lifetime_string += dod.year;
  }
  return lifetime_string;
});

// virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});

// export model
module.exports = mongoose.model("Author", AuthorSchema);
