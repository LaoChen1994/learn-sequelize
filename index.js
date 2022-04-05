const { Sequelize, Op } = require('sequelize')
const { User, Goods, File, Phone, Actor, MovieActor, Movie } = require("./models")

const sequelize = new Sequelize('test1', "root", "123456", {
  dialect: 'mysql',
  host: "127.0.0.1",
  protocol: "http",
  port: 9000
})

async function init(isForce = false) {
  try {
    await sequelize.authenticate()
    User.init(User.attributes, {
      sequelize,
      tableName: User.tableName
    })

    Goods.init(Goods.attributes, {
      sequelize,
      tableName: Goods.tableName
    })

    File.init(File.attributes, {
      sequelize,
      tableName: File.tableName
    })

    Phone.init(Phone.attributes, {
      sequelize,
      tableName: Phone.tableName
    })

    Actor.init(Actor.attributes, {
      sequelize,
      tableName: Actor.tableName
    })

    Movie.init(Movie.attributes, {
      sequelize,
      tableName: Movie.tableName
    })

    MovieActor.init(MovieActor.attributes, {
      sequelize,
      tableName: MovieActor.tableName
    })

    // 一对一创建
    // 后续可以通过setUser的方式来创建对应1对1的元素
    User.File =  User.hasOne(File, {
      foreignKey: 'ownerId',
      sourceKey: "id",
      as: "birth"
    })

    // 一对多的关系
    // 后续可以通过Include的方式查询到对应表中的内容
    User.Phones = User.hasMany(Phone, {
      sourceKey: "id",
      foreignKey: "ownerId",
      as: "phones"
    })

    // 多对多关系的声明
    Actor.belongsToMany(Movie, { through: MovieActor, foreignKey: 'actorId', as: 'movies' })
    Movie.belongsToMany(Actor, { through: MovieActor, foreignKey: 'movieId', as: 'actors' })

    await sequelize.sync({ force: !!isForce })


  } catch (error) {
    console.log(error)
  }
}

async function add() {
  // 一对一创建
  /*
  const [user] = await User.findOrCreate({
      where: {
        name: {
          [Op.like]: '%xiaodeng%'
        }
      },
      defaults: {
        name: "xiaodeng"
      }
  })

  const file = await File.create({
      title: `pi essay ${Math.random()}`,
      content: `content ${Math.random()}`
  })

  await user.setBirth(file)
  */

  // 一对多创建
  /*
  await User.create({
    name: "xiaoze",
    phones: [{
      name: "IPhone 13 pro max",
      type: "Apple"
    }, {
      name: "Mate P30",
      type: "Hua Wei"
    }]
  }, {
    include: [{
      model: Phone,
      as: 'phones'
    }]
  })
  */

  // 多对多创建
  const actors = await Actor.bulkCreate([{
    name: "wangbaoqiang",
    sex: "male"
  },{
    name: "tongliya",
    sex: "female"
  }, {
    name: "SunHonglei",
    sex: "female"
  }])

  const Movies = await Movie.bulkCreate([{
    name: "Qianfu",
    fee: 100
  }, {
    name: "TangTan",
    fee: 100
  }, {
    name: "newMoview",
    fee: 200
  }])

  await Movies[0].setActors(actors.slice(0, 2))
  await Movies[1].setActors([actors[2]])
  await Movies[2].setActors(actors)
}

async function query() {
  // 一对一查询
  // 一对一和一对多查询
  // const { rows, count } = await User.findAndCountAll({
  //   where: {
  //     name: {
  //       [Op.like]: '%xiaoze%'
  //     }
  //   },
  //   include: [{
  //     model: File,
  //     as: 'birth'
  //   },{
  //     model: Phone,
  //     as: 'phones'
  //   }]
  // })

  // console.log(JSON.stringify(rows.map(item => item.toJSON()), null, 2))

  // 一对多查询
  // const { rows, count } = await User.findAndCountAll({
  //   include: [{
  //     model: Phone,
  //     as: 'phones'
  //   }]
  // })

  // 多对多查询
  const { rows: movies } = await Movie.findAndCountAll({
    include: [{
      model: Actor,
      as: 'actors'
    }]
  })

  const { rows: actors } = await Actor.findAndCountAll({
    include: [{
      model: Movie,
      as: 'movies'
    }]
  })

  console.log(JSON.stringify(actors.map(item => item.toJSON()), null, 2))

}

async function addOne () {
  // 一对多，创建新的关联关系
  const [user] = await User.findOrCreate({
    where: {
      id: 1
    }
  })

  const phones = await Phone.bulkCreate([{
    name: "iphone 13",
    type: "Apple"
  }, {
    name: "Mate 40 Pro",
    type: "HuaWei"
  }])

  await user.setPhones(phones)

  // 一对一，使用setBirth的方式，在已有的数据上创建关联关系
  // const file = await File.create({
  //   name: "small essay",
  //   content: "are you ok"
  // })

  // await user.setBirth(file)

  // await User.create({
  //   name: "xiaoliu",
  //   birth: {
  //     title: "xiaoliuzhengming",
  //     content: 'content'
  //   }
  // }, {
  //   include: [{
  //     model: File,
  //     as: 'birth'
  //   }]
  // })

  
}

(async () => {
  await init()
  // await add()
  // await addOne()
  await query()

  await sequelize.close()
})()

