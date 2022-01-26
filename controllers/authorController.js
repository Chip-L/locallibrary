const async = require("async");
const { body, validationResult } = require("express-validator");

const Author = require("../models/author");
const Book = require("../models/book");

// Display list of all Authors.
exports.author_list = function (req, res, next) {
  Author.find()
    .collation({ locale: "en" })
    .sort([["family_name", "ascending"]])
    .exec((err, author_list) => {
      if (err) return next(err);

      res.render("author_list", {
        title: "Author List",
        author_list,
      });
    });
};

// Display detail page for a specific Author.
exports.author_detail = function (req, res, next) {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authors_books: function (callback) {
        Book.find(
          {
            author: req.params.id,
          },
          "title summary"
        ).exec(callback);
      },
    },
    (err, results) => {
      console.log(results);

      if (err) return next(err);
      if (results.author == null) {
        const err = new Error("Author not found");
        err.status = 404;
        return next(err);
      }

      res.render("author_detail", {
        title: "Author Detail",
        author: results.author,
        author_books: results.authors_books,
      });
    }
  );
};

// Display Author create form on GET.
exports.author_create_get = function (req, res) {
  res.render("author_form", { title: "Create Author" });
};

// Handle Author create on POST.
exports.author_create_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const newData = req.body;

    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author",
        author: newData,
        errors: errors.array(),
      });
      // return;
    } else {
      // this is not checking for duplicates... which may be ok, but there should be some sort of confirmation to duplicate
      const author = new Author(newData);
      author.save((err) => {
        if (err) return next(err);

        res.redirect(author.url);
      });
    }
  },
];

// Display Author delete form on GET.
exports.author_delete_get = function (req, res, next) {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
      author_books: function (callback) {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },
    (err, { author, author_books }) => {
      if (err) return next(err);

      //  author is not in the database (nothing to delete), so render the list of all authors.
      if (author == null) {
        res.redirect("/catalog/authors");
      }

      res.render("author_delete", {
        title: "Delete Author",
        author,
        author_books,
      });
    }
  );
};

// Handle Author delete on POST.
exports.author_delete_post = function (req, res, next) {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.body.id).exec(callback);
      },
      author_books: function (callback) {
        Book.find({ author: req.body.authorid }).exec(callback);
      },
    },
    (err, { author, author_books }) => {
      if (err) return next(err);

      if (author_books.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render("author_delete", {
          title: "Delete Author",
          author,
          author_books,
        });
      } else {
        // Author has no books (or doesn't exist). Delete object and redirect to the list of authors.
        Author.findByIdAndRemove(req.body.authorid, (err) => {
          if (err) return next(err);

          res.redirect("/catalog/authors");
        });
      }
    }
  );
};

// Display Author update form on GET.
exports.author_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST.
exports.author_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: Author update POST");
};
