const {MongoClient} = require("mongodb");
// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const dbName = "se1900_db";
async function main() {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);

  
  const collection = db.collection("Students");

  
  const insertResult = await collection.insertOne({
    name: "Nguyễn Sinh Viên Test",
    age: 20,
    major: "Software Engineering",
  });
  console.log("Đã thêm 1 sinh viên với _id:", insertResult.insertedId);

  
  console.log("Danh sách 5 sinh viên:");
  const findResult = await collection.find({}).limit(5).toArray();
  console.log(findResult);

  console.log("Tìm sinh viên vừa thêm:");
  const findOneResult = await collection.findOne({
    _id: insertResult.insertedId,
  });
  console.log(findOneResult);


  const updateResult = await collection.updateOne(
    {_id: insertResult.insertedId},
    {$set: {age: 21, major: "Artificial Intelligence"}},
  );
  console.log("Đã cập nhật:", updateResult.modifiedCount, "sinh viên.");

  
  const findUpdated = await collection.findOne({_id: insertResult.insertedId});
  console.log("Sinh viên sau khi cập nhật:", findUpdated);

 
  const deleteResult = await collection.deleteOne({
    _id: insertResult.insertedId,
  });
  console.log("Đã xóa:", deleteResult.deletedCount, "sinh viên test.");

  return "Hoàn thành các thao tác CRUD trên database se1900_db.";
}
main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
