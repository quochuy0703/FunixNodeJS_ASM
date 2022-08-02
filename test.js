const WorkedHour = require("./models/workedHour");
const User = require("./models/user");
const mongoose = require("mongoose");

const MONGODB_URI =
  "mongodb+srv://huymq:huymq123456@cluster0-gm4fb.mongodb.net/funixAsm?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    return User.getManagerOnDepartment("HR");
  })
  .then((users) => {
    console.log(users);
    process.exit(1);
  })
  .catch((err) => console.log(err));

// .then((result) => {
//   return WorkedHour.updateMany(
//     {
//       $expr: {
//         $eq: [
//           { $dateToString: { format: "%Y-%m", date: "$workDate" } },
//           `2022-06`,
//         ],
//       },
//     },
//     { $unset: { isLock: true } }
//   );
// })
// .then((result) => {
//   console.log(result);
// })
// .catch((err) => console.log(err));

// .then((result) => {
//   console.log("connect database!");
//   return WorkedHour.find();
//   // return WorkedHour.updateMany(
//   //   {
//   //     _id: new mongoose.mongo.ObjectId("62d567a6fdcd100dac7eee40"),
//   //     "sessionWorks._id": { $exists: true },
//   //   },
//   //   { $set: { "sessionWorks.$._id": new mongoose.mongo.ObjectId() } },
//   //   { multi: true }
//   // );
//   // return WorkedHour.updateMany(
//   //   { _id: new mongoose.mongo.ObjectId("62d567a6fdcd100dac7eee40") },
//   //   [
//   //     {
//   //       $set: {
//   //         sessionWorks: {
//   //           $function: {
//   //             body: "function (ar) {return ar.map(x => { if(x.hasOwnProperty('_id')) return x; else {x[\"_id\"]=new mongoose.mongo.ObjectId(); return x;}})}",
//   //             args: ["$sessionWorks"],
//   //             lang: "js",
//   //           },
//   //         },
//   //       },
//   //     },
//   //   ],
//   //   {
//   //     multi: true,
//   //   }
//   // );
// })
// .then((workedHours) => {
//   console.log(workedHours);
//   workedHours.forEach((workedHour) => {
//     workedHour.sessionWorks.forEach((session) => {
//       session._id = new mongoose.mongo.ObjectId();
//     });
//     workedHour.save();
//   });
// })
// .then((result) => {
//   console.log(result);
// })
// .catch((err) => console.log(err));

// WorkedHour.updateMany(
//   {
//     _id: new mongoose.mongo.ObjectId("62d01bc56d985d65ab1f5a88"),
//   },
//   { $set: { "sessionWorks.$.new": 2 } }
// )
//   .then((result) => {
//     console.log(result);
//     res.redirect("/manage");
//   })
//   .catch((err) => console.log(err));

// WorkedHour.find({
//   $expr: {
//     $eq: [
//       { $dateToString: { format: "%Y-%m-%d", date: "$workDate" } },
//       "2022-06-14",
//     ],
//   },
// })
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
