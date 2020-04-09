const API = require("./lib/API");
const readlineSync = require("readline-sync");
const chalk = require("chalk");

const mainMenu = () => {
  console.log("--------------------");
  console.log(chalk.blue.bold("--------IMDb--------"));
  console.log("--------------------");

  const answer = readlineSync.keyInSelect(
    ["Movie list", "Leave review"],
    chalk.greenBright("Please choose your option "),
    { cancel: "Exit" }
  );
  switch (answer) {
    case 0:
      movieList();
      promptToMainMenu();
      mainMenu();
      break;
    case 1:
      leaveReview();
      promptToMainMenu();
      mainMenu();
      break;
    default:
      return;
  }
};

const chooseMovie = (question) => {
  const movies = API.read("movies");
  const movieTitles = movies.map((movie) => {
    return movie.title;
  });

  const index = readlineSync.keyInSelect(
    movieTitles,
    chalk.greenBright(question),
    { cancel: "Go back" }
  );
  if (index === -1) {
    return undefined;
  }
  return movies[index];
};

const movieList = () => {
  const movie = chooseMovie("Please choose a movie ");
  if (movie === undefined) {
    return;
  }

  console.log(`
  ------------------------
  Movie: "${movie.title}"
  Year: ${movie.year}
  Genres: ${movie.genres.join(", ")}
  Directors: ${movie.directors.join(", ")}
  Major cast: ${movie.majorCast.join(", ")}
  Reviews:`);

  if (movie.reviews.length === 0) {
    console.log("No reviews yet...");
  } else {
    movie.reviews.forEach((review) => {
      console.log(chalk.magentaBright("-", review.text));
    });

    let allRatings = 0;
    movie.reviews.forEach((review) => {
      allRatings += review.rating;
    });
    const averageRating = allRatings / movie.reviews.length;

    console.log(`  Average rating: ${averageRating}/10`);
  }
};

const leaveReview = () => {
  let movie = chooseMovie("Which movie mould you like to review? ");
  if (movie === undefined) {
    return;
  }

  const prompt = chalk.yellow(
    `Please write your review for movie "${movie.title}": `
  );
  const review = readlineSync.question(prompt, {
    limit: (string) => {
      return string !== "";
    },
  });

  const rating = readlineSync.question("What is your rating from 1 to 10: ", {
    limit: (number) => {
      return number >= 1 && number <= 10;
    },
  });

  const newReview = {
    rating: parseInt(rating),
    text: review,
  };
  movie.reviews.push(newReview);

  API.update("movies", movie);

  console.log(chalk.magentaBright("Thank you for the review! "));
};

const promptToMainMenu = () => {
  readlineSync.question(
    chalk.cyanBright("To return to main menu press enter "),
    {
      hideEchoBack: true,
      mask: "",
    }
  );
};

mainMenu();
