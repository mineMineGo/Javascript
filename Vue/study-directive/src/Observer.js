import { def } from "./utils"
import defineReactive from "./defineReactive"
import { arrayMethods } from './array'
import { observe } from "./observe"
import Dep from "./Dep"

export default class Observer{
  constructor(value){
    // 每一个observer 实例身上就有一个dep实例
    this.dep = new Dep()
    // 给实例(this, 注意：构造函数中的this 不是表示 类本身，而是表示实例) 添加了__ob__属性，值是这次 new 的实例
    //value.__ob__ // 这个属性应该是不可遍历属性
    def(value,'__ob__',this, false)
    // 检查他是数组还是对象
    if(Array.isArray(value)){
      // 如果是数组，要将这个数组的原型 指向 arrayMethods
      Object.setPrototypeOf(value, arrayMethods)
      // 让数组变为响应式
      this.observeArray(value)
    }else{
      this.walk(value)
    }
  }

  // 遍历
  walk(value){
    for (const key in value) {
      defineReactive(value, key)
    }
  }
 
  // 数组的特殊遍历
  observeArray(arr){
    for (let index = 0, l=arr.length; index <l; index++) {
      // 逐项进行遍历
      observe(arr[index])
    }
  }
}