const { body, validationResult } = require("express-validator");

const Book = require("../models/book");
const BookInstance = require("../models/bookInstance");

// Display list of all BookInstances.
exports.bookInstance_list = function (req, res, next) {
  BookInstance.find()
    .populate("book")
    .sort({ title: 1 })
    .exec(function (err, list_bookinstances) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookInstance_detail = function (req, res) {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec(function (err, bookinstance) {
      if (err) {
        return next(err);
      }
      if (bookinstance == null) {
        // No results.
        var err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("bookinstance_detail", {
        title: "Copy: " + bookinstance.book.title,
        bookinstance: bookinstance,
      });
    });
};

// Display BookInstance create form on GET.
exports.bookInstance_create_get = function (req, res, next) {
  Book.find({}, "title")
    .collation({ locale: "en" })
    .sort({ title: 1 })
    .exec((err, book_list) => {
      if (err) return next(err);

      res.render("bookinstance_form", {
        title: "Create Book Instance",
        book_list,
      });
    });
};

// Handle BookInstance create on POST.
exports.bookInstance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  (req, res, next) => {
    const errors = validationResult(req);
    const newData = req.body;

    const bookInstance = new BookInstance(newData);

    if (!errors.isEmpty()) {
      Book.find({}, "title")
        .collation({ locale: "en" })
        .sort({ title: 1 })
        .exec((err, book_list) => {
          if (err) return next(err);

          res.render("bookinstance_form", {
            title: "Create Book Instance",
            book_list,
            selected_book: bookInstance.book._id,
            bookInstance,
            errors: errors.array(),
          });
        });
    } else {
      bookInstance.save((err) => {
        if (err) return next(err);

        res.redirect(bookInstance.url);
      });
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookInstance_delete_get = function (req, res) {
  res.send("NOT IMPLEMENTED: BookInstance delete GET");
};

// Handle BookInstance delete on POST.
exports.bookInstance_delete_post = function (req, res) {
  res.send("NOT IMPLEMENTED: BookInstance delete POST");
};

// Display BookInstance update form on GET.
exports.bookInstance_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};

// Handle BookInstance update on POST.
exports.bookInstance_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
};
