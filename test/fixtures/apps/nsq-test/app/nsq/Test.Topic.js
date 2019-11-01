// export function or async function
module.exports = (ctx, msg) => {
  const { tag, body } = msg.value;
  ctx.app.nsqMsg.set(tag, body);
};

/*
export subscribe class
class Subscribe {
  constructor(ctx) {
    this.ctx = ctx;
  }
  async subscribe(msg) {}
}

*/
