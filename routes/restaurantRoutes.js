const express = require("express");
const router = express.Router();
const User = require("../models/user");
const axios = require("axios");

const API_KEY = process.env.API_KEY;

router.get("/onerestaurant", (req, res) => {
  res.render("oneUserInput.ejs");
});

router.get("/couplesrestaurant", (req, res) => {
  res.render("twoUserInput.ejs");
});

router.post("/couplesrestaurant/createuser", async (req, res) => {
  const username1 = req.body.username1;
  const username2 = req.body.username2;

  const findUser1 = await User.findOne({ Name: username1 });
  const findUser2 = await User.findOne({ Name: username2 });

  if (findUser1) {
    findUser1.CoupleName = username2;
    findUser1.RestaurantChoices = [];
    findUser1.FoodChoices = [];

    await findUser1.save();
  } else {
    const newUser1 = new User({
      Name: username1,
      CoupleName: username2,
      RestaurantChoices: [],
      FoodChoices: [],
    });

    await newUser1.save();
  }

  if (findUser2) {
    findUser2.CoupleName = username1;
    findUser2.RestaurantChoices = [];
    findUser2.FoodChoices = [];

    await findUser2.save();
  } else {
    const newUser2 = new User({
      Name: username2,
      CoupleName: username1,
      RestaurantChoices: [],
      FoodChoices: [],
    });

    await newUser2.save();
  }

  res.redirect(`/${username1}/selectrestaurant`);
});

router.post("/onerestaurant/createuser", async (req, res) => {
  const username = req.body.username;
  const findUser1 = await User.findOne({ Name: username });

  if (findUser1) {
    findUser1.CoupleName = null;
    findUser1.RestaurantChoices = [];
    findUser1.FoodChoices = [];

    await findUser1.save();
  } else {
    const newUser = new User({
      Name: username,
      CoupleName: null,
      RestaurantChoices: [],
      FoodChoices: [],
    });

    await newUser.save();
  }

  axios
    .get(`https://api.yelp.com/v3/businesses/search?location=US&limit=40`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })
    .then((response) => {
      const businesses = response.data.businesses;
      res.render("showAllRest.ejs", { businesses, username });
    })
    .catch((error) => {
      console.error("Error fetching data", error);
    });
});

router.get("/:username/selectrestaurant", (req, res) => {
  const username = req.params.username;
  axios
    .get(`https://api.yelp.com/v3/businesses/search?location=US&limit=40`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })
    .then((response) => {
      const businesses = response.data.businesses;
      res.render("selectRestaurantPage.ejs", { businesses, username });
    })
    .catch((error) => {
      console.error("Error fetching data", error);
    });
});

router.post("/:username/selectfood", async (req, res) => {
  const selectedrestId = req.body.selectedrest;

  const user = await User.findOne({ Name: req.params.username });
  selectedrestId.forEach((element) => {
    user.RestaurantChoices.push(element);
  });

  await user.save();

  const allCuisines = [
    {
      name: "Global",
      imgUrl:
        "https://thebrownandwhite.com/wp-content/uploads/2015/04/150421_Global_Cuisine_web.jpg",
    },
    {
      name: "Indian",
      imgUrl:
        "https://cdn.vox-cdn.com/thumbor/aNM9cSJCkTc4-RK1avHURrKBOjU=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/20059022/shutterstock_1435374326.jpg",
    },
    {
      name: "Chinese",
      imgUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Collage_Chinese_Cuisine_by_User-EME.png/640px-Collage_Chinese_Cuisine_by_User-EME.png",
    },
    {
      name: "American",
      imgUrl:
        "https://img.freepik.com/free-vector/hand-drawn-american-cuisine_52683-83633.jpg?w=2000",
    },
    {
      name: "Italian",
      imgUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Collage_cucina_italiana.jpg/300px-Collage_cucina_italiana.jpg",
    },
    {
      name: "French",
      imgUrl:
        "https://upload.wikimedia.org/wikipedia/commons/6/6a/Jacques_Lameloise%2C_escab%C3%A8che_d%27%C3%A9crevisses_sur_gaspacho_d%27asperge_et_cresson.jpg",
    },
    {
      name: "Japanese",
      imgUrl:
        "https://t0.gstatic.com/licensed-image?q=tbn:ANd9GcQCLruCufHhv07DowkpxA8faez5cwb3k-4JBD183BeETdq-KpnoBUg8MMyXu-2LTwpp",
    },
    {
      name: "Thai",
      imgUrl:
        "https://img.freepik.com/premium-vector/thai-food-thailand-cuisine-menu_8071-3553.jpg?w=2000",
    },
    {
      name: "Spanish",
      imgUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Paella_de_marisco_01.jpg/220px-Paella_de_marisco_01.jpg",
    },
    {
      name: "Indonesian",
      imgUrl:
        "https://upload.wikimedia.org/wikipedia/commons/6/69/Food_Sundanese_Restaurant%2C_Jakarta.jpg",
    },
    {
      name: "Mexican",
      imgUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Collage_Mexican_Cuisine_by_User-EME.png/1200px-Collage_Mexican_Cuisine_by_User-EME.png",
    },
    {
      name: "Korean",
      imgUrl:
        "https://media.cnn.com/api/v1/images/stellar/prod/181114130138-korean-food-2620014201204004k-jeonju-bibimbap.jpg?q=h_900,w_1100,x_248,y_0,c_crop/h_1100,w_1100,c_lpad,b_rgb:061015",
    },
    {
      name: "Pakistani",
      imgUrl:
        "https://upload.wikimedia.org/wikipedia/commons/c/c4/Pakistani_Food_Karahi_Beef.jpg",
    },
  ];

  res.render("selectFoodTypePage.ejs", { allCuisines, username: user.Name });
});

router.post("/:username/submit", async (req, res) => {
  const selectedcuisinesId = req.body.selectedCuisines;

  const user = await User.findOne({ Name: req.params.username });
  selectedcuisinesId.forEach((element) => {
    user.FoodChoices.push(element);
  });

  await user.save();

  const partner = await User.findOne({ Name: user.CoupleName });

  if (
    partner.FoodChoices.length == 0 ||
    partner.RestaurantChoices.length == 0
  ) {
    res.redirect(`/${partner.Name}/selectrestaurant`);
  } else {
    res.redirect(`/${user.Name}/${partner.Name}/result`);
  }
});

router.get("/:username1/:username2/result", async (req, res) => {
  const user1 = await User.findOne({ Name: req.params.username1 });
  const user2 = await User.findOne({ Name: req.params.username2 });

  const commonRestaurants = [];
  const commonFoodRestaurants = [];

  //for common rest choice
  for (let i = 0; i < user1.RestaurantChoices.length; i++) {
    if (user2.RestaurantChoices.includes(user1.RestaurantChoices[i])) {
      const res = await axios.get(
        `https://api.yelp.com/v3/businesses/${user1.RestaurantChoices[i]}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      commonRestaurants.push(res.data);
    }
  }

  //for common food choice
  const user1FoodRest = [];
  for (let i = 0; i < user1.FoodChoices.length; i++) {
    const res1 = await axios.get(
      `https://api.yelp.com/v3/businesses/search?location=US&term=${user1.FoodChoices[i]}&sort_by=best_match&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    // console.log(res1.data.businesses);

    for (let j = 0; j < res1.data.businesses.length; j++) {
      user1FoodRest.push(res1.data.businesses[j]);
    }
  }

  for (let i = 0; i < user2.FoodChoices.length; i++) {
    const res2 = await axios.get(
      `https://api.yelp.com/v3/businesses/search?location=US&term=${user2.FoodChoices[i]}&sort_by=best_match&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    for (let j = 0; j < res2.data.businesses.length; j++) {
      if (user1FoodRest.find((res) => res.id == res2.data.businesses[j].id)) {
        commonFoodRestaurants.push(res2.data.businesses[j]);
      }
    }
  }
  res.render("result.ejs", { commonRestaurants, commonFoodRestaurants });
});

router.get("/search", async (req, res) => {
  const searchKey = req.query.search;
  const cuisine = req.query.Cuisines;
  let response;

  if (cuisine != "null") {
    response = await axios.get(
      `https://api.yelp.com/v3/businesses/search?term=${cuisine}&location=US&limit=40`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
  } else {
    response = await axios.get(
      `https://api.yelp.com/v3/businesses/search?location=US&limit=40`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
  }
  const businesses = response.data.businesses;
  const temp = [];

  for (let i = 0; i < businesses.length; i++) {
    if (businesses[i].name.toLowerCase().includes(searchKey)) {
      temp.push(businesses[i]);
    }
  }

  res.render("showAllRest.ejs", { businesses: temp });
});

router.get("/logout", (req, res) => {
  res.redirect("/");
});

module.exports = router;
