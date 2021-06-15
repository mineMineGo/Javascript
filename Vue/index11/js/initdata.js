let ARRAY_METHOD = [
  "push",
  "pop",
  "shift",
  "unshift",
  "reverse",
  "sort",
  "splice"
]
let array_method = Object.create(Array.prototype)
ARRAY_METHOD.forEach(method => {
  array_method[method] = function(){
    // 这里增加改写的方法 
    // 在这里将数据进行响应式化
    console.log("调用的是拦截器中的"+method+"的方法")
    // 循环 arguments ，变为响应式
    for (let index = 0; index < arguments.length; index++) {
      const element = arguments[index];
      reactify(element)
    }  
    // 调用原来的方法
    let res =  Array.prototype[method].apply(this, arguments)
    return res
  }
})



// 响应式化的部分
function defineReactive(target,key,value,enumerable){
  let that = this
  if(typeof value === "object" && value !== null && !Array.isArray(value)){
    // 是一个非数组的引用类型
    reactify(value)  // 递归调用 
  }
  // 函数内部就是一个局部作用域，这个value就只限于函数内使用的变量（闭包）
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: !!enumerable,
    get(){
      console.log(`读取了${key}属性`)
      return value
    },
    set(newValue){
      console.log(`设置了${key}属性为${newValue}`)
      value = newValue
      // 这个方法暂时只是过渡，不安全
      if(typeof newValue === "object" && newValue !== null){
        reactify(newValue)
      }
      // 这里进行模板刷新(即可实现界面响应化，这里是假的，只是演示)
      // vue实例中是利用watcher，这里暂时没有
      that.mountComponent()
      return true
    }
  })
}

// 将对象 obj 响应式化
function reactify(obj, vm){
  let keys = Object.keys(obj)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]; // 属性名
    const value = obj[key]
    if(Array.isArray(value)){
      value.__proto__ = array_method // 这样数组就通过响应式拦截器变为响应式了
      for (let j = 0; j < value.length; j++) {
        const element = value[j];
        reactify(element) // 递归
      }
    }else{
      // 对象或者值类型
      defineReactive.call(vm, obj, key, value, true)
    }
    // 在这里添加代理即可*（问题：在这类写的代码会递归）
    // 如果在这里将属性映射到 vue 实例上，那么就表示vue实例可以使用属性 key
  }
}

// 将 某一个对象的属性访问 映射到 对象的某一个属性成员上
function proxy(target, prop, key){
  Object.defineProperty(target,key, {
    enumerable: true,
    configurable: true,
    get(){
      return target[prop][key]
    },
    set(newValue){
      target[prop][key] = newValue
      return true
    }
  })
}

JGVue.prototype.initData = function(){
  // 遍历 this._data 的成员 将属性转换为响应式的，将直接属性 代理到实力上
  let keys = Object.keys(this._data)
  reactify(this._data, this)
  // 响应式
  for (let index = 0; index < keys.length; index++) {
    // 这里将对象 this._data[Keys[index]] 变成响应式的
    //const key = keys[index];
    //reactify(this._data[key], this)
    //this.observer(this._data, keys[i])
  }
  // 代理
  for (let index = 0; index < keys.length; index++) {
    // 这里将 this._data[keys[i]] 映射到 this[keys[i]] 上
    const elementKey = keys[index];
    proxy(this, "_data", elementKey)
  }
}