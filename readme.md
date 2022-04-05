# Sequelize学习笔记（二）一对一、一对多、多对多关系

## 前期准备

### 数据库链接

这里使用的是本地docker中的镜像，具体映射到宿主机的端口为9000，可以执行如下命令，拉起一个自己的docker镜像：

```bash
docker run --name mysql1 -e MYSQL_ONETIME_PASSWORD=123456 -p 9000:3306 -d mysql/mysql-server:latest
```



之后我们通过`Sequelize`来链接数据库

```javascript
// index.js
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('test1', "root", "123456", {
  dialect: 'mysql',
  host: "127.0.0.1",
  protocol: "http",
  port: 9000
})


try {
    // 验证数据库是否链接成功
    await sequelize.authenticate()
} catch (err) {}
```

## 一、一对一

### 1.1 模拟场景

假设一个用户 **(User)** 只能有一份出生证明 **(BitrhAuth)** ，所以这里我们需要创建两张表`User`和`BirthAuth`，并且建立他们之间的一对一的关系



### 1.2 表的创建以及关联关系

#### 1.2.1 定义表

注意这里目前只是定义了表的结构，实际数据库中是没有创建这张表的

```javascript
// model.js
const { Model, INTEGER, STRING, TEXT } = require('sequelize')

// 通过Model的方式来创建表
class User extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    name: STRING(255)
  }

  // 这里的表名，就是创建到数据库中的表名
  static tableName = "Buyer"
}

class File extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    title: STRING(255),
    content: TEXT("medium"),
    ownerId: INTEGER
  }
  static tableName = "Birth_Auth"
}
```



#### 1.2.2 创建表和关联表

使用`init`方法来创建对应的表，并且通过`sequlize`参数将模型和数据库进行链接，之后通过`hasOne`来声明对应的关系

直到使用`sync`方法，这个时候才向数据库去同步对应的操作

```javascript
async function init() {
  try {
    await sequelize.authenticate()
    User.init(User.attributes, {
      sequelize,
      tableName: User.tableName
    })

    File.init(File.attributes, {
      sequelize,
      tableName: File.tableName
    })

    // 一对一创建
    // 后续可以通过setUser的方式来创建对应1对1的元素
    // 这里的hasOne其实就是User和File的关联关系了
    // 通过User的静态变量进行保存，可以在创建user的同时对File进行创建
    User.File =  User.hasOne(File, {
      // 这个foreignKey最终是落在File表中的，就是File的配置
      foreignKey: 'ownerId',
      // 这个sourceKey目前代表的是一个
      sourceKey: "id",
      // 这个as非常重要
      // 因为在产生关联关系之后，后续sequelize会增加一个setXXX的方法用于同时创建关联关系
      // 这个时候直接使用的就是这个as的变量
      as: "birth"
    })
  } catch(e) {
      console.log(e) 
  }

  // 直到使用sync才是向数据库同步表的操作～
  await sequelize.sync({ force: !!isForce })
}
```

### 1.2 创建

完成了上述关联关系之后，我们就来创建一条`User`和`File`之间的数据

```javascript
// 为已有的用户添加出生证明
async function addInExist() {
  // 一对一创建
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

  // 这里就是通过setBirth来将user和file两者进行关联
  await user.setBirth(file)
}

// 通过include model的方式可以同时创建对应一对一、一对多的关系
async function addInCreate() {
  await User.create({
    name: "xiaoliu",
    birth: {
      title: "xiaoliuzhengming",
      content: 'content'
    }
  }, {
    include: [{
      model: File,
      as: 'birth'
    }]
  })
}
```

### 1.3 查询

在查询的时候和创建的场景一样，通过`option`参数中的`include`，来对已有的关联关系进行查询

```javascript
async function query() {
  // 一对一查询
  // 一对一和一对多查询
  const { rows, count } = await User.findAndCountAll({
    include: [{
      model: File,
      as: 'birth'
    }]
  })
}

/*
查询出的结果如下
[
  {
    "id": 1,
    "name": "xiaodeng",
    "createdAt": "2022-04-05T05:28:08.000Z",
    "updatedAt": "2022-04-05T05:28:08.000Z",
    // 会同时将birth查出来
    "birth": {
      "id": 13,
      "title": "pi essay 0.5358826142709898",
      "content": "content 0.42366009995271936",
      "ownerId": 1,
      "createdAt": "2022-04-05T05:33:41.000Z",
      "updatedAt": "2022-04-05T05:33:41.000Z"
    }
  }
]
*/
```

## 二、一对多

### 2.1 模拟场景

假设一个用户 **(User)** 能买多个不同的手机 **(Phone)** ，所以这里我们需要创建两张表`User`和`Phone`，并且建立他们之间的一对多的关系

### 2.2 表的创建以及关联关系

#### 2.2.1 定义表

```javascript
class Phone extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    name: STRING(255),
    type: STRING(255)
  }

  static tableName = "Phone"
}
```

#### 2.2.2 创建表和关联表

使用`init`方法来创建对应的表，并且通过`sequlize`参数将模型和数据库进行链接，之后通过`hasMany`来声明对应的关系

```javascript
function init() {
    // 省略1中的部分代码
    // 创建Phone这张表
    Phone.init(Phone.attributes, {
      sequelize,
      tableName: Phone.tableName
    })

    // 一对多的关系
    // 后续可以通过Include的方式查询到对应表中的内容
    User.Phones = User.hasMany(Phone, {
        // sourceKey是User的field
        sourceKey: "id",
        // 这里的foreignKey是Phone中关联的字段
        foreignKey: "ownerId",
        as: "phones"
    })
}
```

### 2.3 创建

```javascript
// User已有，这个时候去添加对应的手机id
async function addOne () {
  const [user] = await User.findOrCreate({
    where: {
      id: 1
    }
  })

  // 
  const phones = await Phone.bulkCreate([{
    name: "iphone 13",
    type: "Apple"
  }, {
    name: "Mate 40 Pro",
    type: "HuaWei"
  }])

  // 这里适用setPhones，为什么是Phones？
  // 因为在hasMany创建关联关系中的as就是phones
  // 所以这里也是Phones
  await user.setPhones(phones)
}

async function addInCreate () {
  // 一对多创建
  // 同时创建对应的User和其关联的Phone
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
}
```

### 2.4 查询

查询其实和一对一一样，想要查具体的字段，直接对应的使用`include`，并且关联上相关的`model`即可

```javascript
async function query() {
  // 一对一查询
  // 一对一和一对多查询
  const { rows, count } = await User.findAndCountAll({
    where: {
      name: {
        [Op.like]: '%xiaoze%'
      }
    },
    include: [{
      model: File,
      as: 'birth'
    },{
      model: Phone,
      as: 'phones'
    }]
  })
}

/*
[
  {
    "id": 11,
    "name": "xiaoze",
    "createdAt": "2022-04-05T07:29:49.000Z",
    "updatedAt": "2022-04-05T07:29:49.000Z",
    "birth": null,
    "phones": [
      {
        "id": 21,
        "name": "IPhone 13 pro max",
        "type": "Apple",
        "createdAt": "2022-04-05T07:29:49.000Z",
        "updatedAt": "2022-04-05T07:29:49.000Z",
        "ownerId": 11
      },
      {
        "id": 22,
        "name": "Mate P30",
        "type": "Hua Wei",
        "createdAt": "2022-04-05T07:29:49.000Z",
        "updatedAt": "2022-04-05T07:29:49.000Z",
        "ownerId": 11
      }
    ]
  }
]
*/
```

## 三、多对多

### 3.1 模拟场景

假设一个演员 **(Actor)** 能出演多部电影 **(Movie)** ，而一本电影 **(Movie)**，也可能有多个演员 **(Actor)** 所以这里我们需要创建两张表`Movie`和`Actor`，因为多对多的关系，需要通过中间表`MovieActor`来进行维护彼此的关系，所以这次需要三张表。

### 3.2 表的创建以及关联关系

#### 3.2.1 定义表

```javascript
class Movie extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    name: STRING(255),
    fee: INTEGER
  }

  static tableName = "Movie"
}

class Actor extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    sex: STRING(255),
    name: STRING(255)
  }

  static tableName = 'Actor'
}

class MovieActor extends Model {
  static attributes = {
    actorId: INTEGER,
    movieId: INTEGER
  }

  static tableName = 'MovieActor'
}
```

#### 3.2.2 创建表和关联表

使用`init`方法来创建对应的表，并且通过`sequlize`参数将模型和数据库进行链接，之后通过`belongsToMany`来声明对应的关系

```javascript
// index.js

function init() {
    // ...省略上述已重复的代码
    // 需要先将上述三张表进行初始化
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

    // 分别向对面的表申明关系为一对多
    // 这里需要注意，多对多的场景，我们需要通过中间表来处理两者的关联关系
    // 所以这个through，这个中间表的字段是必填
    Actor.belongsToMany(Movie, { through: MovieActor, foreignKey: 'actorId', as: 'movies' })
    Movie.belongsToMany(Actor, { through: MovieActor, foreignKey: 'movieId', as: 'actors' })
}
```

### 3.1 创建

```javascript
function add () {
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

  // 这里的setActors就是从as里面取的，这个就不赘述
  await Movies[0].setActors(actors.slice(0, 2))
  await Movies[1].setActors([actors[2]])
  await Movies[2].setActors(actors)
}
```

### 3.2 查询

这里因为是多对多的关系，所以无论是从`Actors`查询`Movie`还是从`Movie`查`Actors`都是可以的

```javascript
function query() {
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
}
```

## 四、TS支持

### 4.1 模型定义部分

在TS支持的部分只需要明确几个点：

1. 如何把attributes的数据结构能够通过`.`的方式进行提示

2. 对于代码中混入的那些`getActors`,`setActors`等方法如何提示

其实只需要通过`declare`进行声明即可～

```typescript
import { Model, INTEGER, STRING, HasManySetAssociationsMixin, HasManyGetAssociationsMixin } from 'sequelize'

class Actor extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    sex: STRING(255),
    name: STRING(255)
  }

  static tableName = 'Actor'

  declare id: number;
  declare sex: string;
  declare name: string;

  declare setMovies: HasManySetAssociationsMixin<Movie, number>
  declare getMovies: HasManyGetAssociationsMixin<Movie>

}

class Movie extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    name: STRING(255),
    fee: INTEGER
  }

  static tableName = "Movie"

  declare id: number;
  declare name: string;
  declare fee: number;

  declare getActors: HasManyGetAssociationsMixin<Actor>
  declare setActors: HasManySetAssociationsMixin<Actor, number>
}

class MovieActor extends Model {
  static attributes = {
    actorId: INTEGER,
    movieId: INTEGER
  }

  static tableName = 'MovieActor'
}


export {
  Actor,
  Movie,
  MovieActor
}
```



### 4.2 重构演员电影部分的代码

```typescript
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
```

## 五、几个Key的简单记忆

这里有几个我们在使用关联关系中用到的Key：`foreignKey`、`sourceKey`和`targetKey`（本次没有用到）以及`hasXX(One/Many)`和`BelongToXX`之间的关系，可以按照下面的来进行总结，本人目前适用。

假设我们要的关系是`N对M`，那么对应的创建公式可以是：

`N.hasXXX(M, {foreignKey: 'M的key', sourceKey: 'N的key', as: 'M的别名，用于查询时候setXX时候用'})`

`N.belongToXX(M, {foreignKey: 'N的key', sourceKey: 'M的key', as: 'M的别名，用于查询和赋值的时候setXX, getXX用'})`

从上面的规律来看`belongToXX`和`hasXX`基本上就是相反的


