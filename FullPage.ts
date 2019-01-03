/**
 * 简易的 FullPage Class
 * @todo PC和Mobile拆分 可以 extends BaseFullPage
 * @method index 设置序号
 * @method free 释放监听
 */
export default class FullPage {

  private _offsetHeight: number; // 浏览器高度
  private _index: number = 1; // 当前滚动位置
  private _startY: number;
  private _endY: number;
  private _free: boolean = true; // 当前状态是否空闲
  private _el: HTMLElement;
  private _event: EventTarget;
  private _listeners: Array<EventListener> = [];

  /**
   * 构造函数
   */
  public constructor(el: HTMLElement) {
    el.childNodes.forEach((item: HTMLElement) => {
      item.style.cssText = 'height: 100vh';
      this._offsetHeight = item.offsetHeight; // iPhoneX 适配问题 有更好的方法 现在没时间
    })
    // document.addEventListener('mousedown', this.touchSatrtFunc, false); // 触摸事件
    // document.addEventListener('mousemove', this.touchMoveFunc, false); // 滑动事件
    // document.addEventListener('mouseup', this.touchEndFunc, false); // 离开元素事件
    document.addEventListener('touchstart', this.touchSatrtFunc, false); // 触摸事件
    document.addEventListener('touchmove', this.touchMoveFunc, { passive: false }); // 滑动事件
    document.addEventListener('touchend', this.touchEndFunc, false); // 离开元素事件
    this._el = el;
    this._event = new EventTarget();
  };

  /**
   * 监听切换事件
   * @param {EventListener} func
   */
  public on(func: EventListener): boolean {
    this._listeners.push(func);
    this._event.addEventListener('switch', func, false);
    return true;
  }

  /**
   * 释放事件
   */
  public free(): boolean {
    // document.removeEventListener('mousedown', this.touchSatrtFunc, false); // 触摸事件
    // document.removeEventListener('mousemove', this.touchMoveFunc, false); // 滑动事件
    // document.removeEventListener('mouseup', this.touchEndFunc, false); // 离开元素事件
    document.removeEventListener('touchstart', this.touchSatrtFunc, false); // 触摸事件
    document.removeEventListener('touchmove', this.touchMoveFunc, false); // 滑动事件
    document.removeEventListener('touchend', this.touchEndFunc, false); // 离开元素事件
    this._listeners.forEach((listener) => {
      this._event.removeEventListener('switch', listener, false);
    });
    return true;
  };

  /**
   * touchSatrtFunc
   * @param {TouchEvent} e
   */
  private touchSatrtFunc = (e: TouchEvent): void => {
    this._endY = 0;
    this._startY = Number(e.touches[0].pageY);
    this._free = false;
    this._el.style.transition = 'transform 0s';
  };

  /**
   * touchMoveFunc
   * @param {TouchEvent} e
   */
  private touchMoveFunc = (e: TouchEvent): void => {
    e.preventDefault();
    if (this._free === false) {
      this._endY = Number(e.touches[0].pageY);
      const top: number = Number(this._el.getAttribute('data-y'));
      if (this._startY - this._endY > 0) {
        this._el.style.transform= `translate3d(0, ${this._endY - this._startY - top}px, 0)`;
      } else {
        this._el.style.transform= `translate3d(0, ${-this._startY + this._endY - top}px, 0)`;
      }
    }
  };

  /**
   * touchEndFunc
   * @param {TouchEvent} e
   */
  private touchEndFunc = (e: TouchEvent): void => {
    let index: number = this._index;
    this._free = true;
    this._el.style.transition = '';
    if (this._startY - this._endY > 50 && this._startY - this._endY !== this._startY ) {
      if (index < this._el.childNodes.length) {
        index++;
      }
    } else if (this._endY - this._startY > 50) {
      if (index > 1){
        index--;
      }
    }
    this.index = index;
  };

  /**
   * 设置帧
   * @param {Nnumber} index
   */
  public set index(index: number) {
    if (this._free && index > 0 && index <= this._el.childNodes.length) {
      this._index = index;
      this._el.style.transform = `translate3d(0, ${(this._index - 1) * -this._offsetHeight}px, 0)`;
      this._el.setAttribute('data-y', String((this._index - 1) * this._offsetHeight));
      this._event.dispatchEvent(new CustomEvent('switch', {
        detail: {
          el: this._el,
          index: this.index,
        }
      }));
    }
  };

  /**
   * @return {Number} 获取帧
   */
  public get index(): number {
    return this._index;
  }
};
