import { Sequelize } from "sequelize";
import { Movie, Actor, MovieActor } from "./models/Actor";

const sequelize = new Sequelize("seq", "root", "123456", {
  dialect: "mysql",
  host: "127.0.0.1",
  protocol: "http",
  port: 9000,
});

async function init() {
  [Movie, Actor, MovieActor].forEach(async (model) => {
    await model.init(model.attributes, {
      sequelize,
      tableName: model.tableName,
    });
  });

  Movie.belongsToMany(Actor, {
    through: MovieActor,
    foreignKey: "movieId",
    as: "actors",
  });
  Actor.belongsToMany(Movie, {
    through: MovieActor,
    foreignKey: "actorId",
    as: "movies",
  });

  return sequelize.sync();
}

async function addData() {
  const actors = await Actor.bulkCreate([
    {
      name: "wangbaoqiang",
      sex: "male",
    },
    {
      name: "tongliya",
      sex: "female",
    },
    {
      name: "SunHonglei",
      sex: "female",
    },
  ]);

  const Movies = await Movie.bulkCreate([
    {
      name: "Qianfu",
      fee: 100,
    },
    {
      name: "TangTan",
      fee: 100,
    },
    {
      name: "newMoview",
      fee: 200,
    },
  ]);

  await Movies[0].setActors(actors.slice(0, 2));
  await Movies[1].setActors([actors[2]]);
  await Movies[2].setActors(actors);
}

async function query() {
  const { rows } = await Movie.findAndCountAll({
    include: [
      {
        model: Actor,
        as: "actors",
      },
    ],
  });

  const jsonArray = rows.map((item) => item.toJSON());
  console.log(JSON.stringify(jsonArray, null, 2));
}

(async () => {
  await init();
  await addData();
  await query();

  await sequelize.close();
})();
