const async = require("async");
const { body, validationResult } = require("express-validator");

const Author = require("../models/author");
const Book = require("../models/book");
const BookInstance = require("../models/bookInstance");
const Genre = require("../models/genre");

exports.index = function (req, res) {
  async.parallel(
    {
      book_count: function (callback) {
        Book.countDocuments({}, callback);
      },
      book_instance_count: function (callback) {
        BookInstance.countDocuments({}, callback);
      },
      book_instance_available_count: function (callback) {
        BookInstance.countDocuments({ status: "Available" }, callback);
      },
      author_count: function (callback) {
        Author.countDocuments({}, callback);
      },
      genre_count: function (callback) {
        Genre.countDocuments({}, callback);
      },
    },
    (err, results) =>
      res.render("index", {
        title: "Chip's Library",
        error: err,
        data: results,
      })
  );
};

// Display list of all books.
exports.book_list = function (req, res, next) {
  Book.find({}, "title author")
    .sort({ title: 1 })
    .populate({ path: "author", model: "Author" })
    .exec((err, book_list) => {
      if (err) return next(err);

      // console.log(book_list);
      res.render("book_list", { title: "Book List", book_list });
    });
};

// Display detail page for a specific book.
exports.book_detail = function (req, res, next) {
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id)
          .populate({ path: "author", mode: "Author" })
          .populate("genre")
          .exec(callback);
      },
      book_instance: function (callback) {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.book == null) {
        // No results.
        var err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("book_detail", {
        title: results.book.title,
        book: results.book,
        book_instances: results.book_instance,
      });
    }
  );
};

// Display book create form on GET.
exports.book_create_get = function (req, res, next) {
  async.parallel(
    {
      authors: function (callback) {
        Author.find()
          .collation({ locale: "en" })
          .sort([["family_name", "ascending"]])
          .exec(callback);
      },
      genres: function (callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("book_form", {
        title: "Create Book",
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};

// Handle book create on POST.
exports.book_create_post = [
  // convert author into an array
  (req, res, next) => {
    convertAuthorToArray(req, res, next);
  },
  // convert genre into an array (do this for author too?)
  (req, res, next) => {
    convertGenreToArray(req, res, next);
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author.*").escape(),
  body("author", "Author must not be empty.").isLength({ min: 1 }),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    const errors = validationResult(req);
    const newData = req.body;

    // console.log("newData:\n", newData);

    const book = new Book(newData);
    console.log("book:\n", book.toJSON());

    if (!errors.isEmpty()) {
      // re-render form with sanitized values
      async.parallel(
        {
          authors: (callback) => getAuthors(callback),
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        (err, { authors, genres }) => {
          if (err) return next(err);

          // mark authors and genres as selected
          for (let i = 0; i < authors.length; i++) {
            // look for current book in our list of selected authors
            if (
              book.author.findIndex(
                (item) => String(item) === String(authors[i]._id)
              ) > -1
            ) {
              authors[i].selected = "true";
            }
          }

          for (let i = 0; i < genres.length; i++) {
            // look for current book in our list of selected genres
            if (
              book.genre.findIndex(
                (item) => String(item) === String(genres[i]._id)
              ) > -1
            ) {
              genres[i].checked = "true";
            }
          }

          res.render("book_form", {
            title: "Create Book",
            authors,
            genres,
            book,
            errors: errors.array(),
          });
        }
      );
    } else {
      book.save((err) => {
        if (err) return next(err);

        res.redirect(book.url);
      });
    }
  },
];

// Display book delete form on GET.
exports.book_delete_get = function (req, res) {
  res.send("NOT IMPLEMENTED: Book delete GET");
};

// Handle book delete on POST.
exports.book_delete_post = function (req, res) {
  res.send("NOT IMPLEMENTED: Book delete POST");
};

// Display book update form on GET.
exports.book_update_get = function (req, res, next) {
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id)
          .populate({ path: "author", mode: "Author" })
          .populate("genre")
          .exec(callback);
      },
      authors: (callback) => getAuthors(callback),
      genres: function (callback) {
        Genre.find(callback);
      },
    },
    (err, { book, authors, genres }) => {
      if (err) return next(err);

      // bad id submitted
      if (book === null) {
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }

      //Success

      // note: these can't be made into helper functions because they are slightly different from the ones in the create
      // mark authors and genres as selected
      for (let i = 0; i < authors.length; i++) {
        // look for current book in our list of selected authors
        if (
          book.author.findIndex((item) => String(item) === String(authors[i])) >
          -1
        ) {
          authors[i].selected = "true";
        }
      }

      for (let i = 0; i < genres.length; i++) {
        // look for current book in our list of selected genres
        if (
          book.genre.findIndex((item) => String(item) === String(genres[i])) >
          -1
        ) {
          genres[i].checked = "true";
        }
      }

      // console.log("\nbook:\n", book.toJSON());

      res.render("book_form", {
        title: "Update Book",
        book,
        authors,
        genres,
      });
    }
  );
};

// Handle book update on POST.
exports.book_update_post = [
  // convert author into an array
  (req, res, next) => {
    convertAuthorToArray(req, res, next);
  },
  // convert genre into an array (do this for author too?)
  (req, res, next) => {
    convertGenreToArray(req, res, next);
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author.*").escape(),
  body("author", "Author must not be empty.").isLength({ min: 1 }),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  function (req, res, next) {
    const errors = validationResult(req);
    const newData = req.body;
    newData._id = req.params.id;

    console.log("newData:\n", newData);

    const book = new Book(newData);
    console.log("book:\n", book.toJSON());

    if (!errors.isEmpty()) {
      // re-render form with sanitized values
      async.parallel(
        {
          authors: (callback) => getAuthors(callback),
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        (err, { authors, genres }) => {
          if (err) return next(err);

          // mark authors and genres as selected
          for (let i = 0; i < authors.length; i++) {
            // look for current book in our list of selected authors
            if (
              book.author.findIndex(
                (item) => String(item) === String(authors[i]._id)
              ) > -1
            ) {
              authors[i].selected = "true";
            }
          }

          for (let i = 0; i < genres.length; i++) {
            // look for current book in our list of selected genres
            if (
              book.genre.findIndex(
                (item) => String(item) === String(genres[i]._id)
              ) > -1
            ) {
              genres[i].checked = "true";
            }
          }

          res.render("book_form", {
            title: "Update Book",
            authors,
            genres,
            book,
            errors: errors.array(),
          });
        }
      );
    } else {
      Book.findByIdAndUpdate(req.params.id, book, (err, theBook) => {
        if (err) return next(err);

        console.log("the book:\n", theBook.toJSON());
        res.redirect(theBook.url);
      });
    }
  },
];

function convertAuthorToArray(req, res, next) {
  // console.log("orig.req", req.body);

  if (!(req.body.author instanceof Array)) {
    if (typeof req.body.author === "undefined") {
      req.body.author = [];
    } else {
      req.body.author = new Array(req.body.author);
    }
  }
  next();
}

function convertGenreToArray(req, res, next) {
  if (!(req.body.genre instanceof Array)) {
    if (typeof req.body.genres === "undefined") {
      req.body.genre = [];
    } else {
      req.body.genre = new Array(req.body.genre);
    }
  }
  next();
}

/**
 * Does a simple find and sort on the Authors model. Callback is the function that executes the results.
 * @param {function} cb
 */
function getAuthors(cb) {
  Author.find()
    .collation({ locale: "en" })
    .sort([["family_name", "ascending"]])
    .exec(cb);
}
