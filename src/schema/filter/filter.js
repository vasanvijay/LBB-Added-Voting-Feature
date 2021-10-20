const mongoose = require("mongoose");
module.exports = (connection) => {

  const filterSchema = new mongoose.Schema({
    filterTypeId: mongoose.Schema.Types.ObjectId,
    name: String,
    options: [{
      optionId: mongoose.Schema.Types.ObjectId,
      optionName: String,
      status: Boolean
    }],
  });
  return connection.model("filter", filterSchema, "filter");
};
