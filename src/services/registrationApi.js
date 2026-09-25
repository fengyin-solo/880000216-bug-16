// 阶段登记的模拟后端接口。
// 前端原型没有真实服务端，这里用 Promise + 可注入的失败规则模拟：
// - 网络/服务端失败时拒绝请求，不改动批次状态，调用方可拿同一参数重试；
// - 默认约四成概率失败，方便演示失败后重试的交互；
// - 同一批次同一目标阶段重试时，若此前只是服务端拒绝，重试应能成功。
let failureRoller = () => Math.random() < 0.4

export function setRegistrationFailureRoller(roller) {
  failureRoller = typeof roller === 'function' ? roller : () => false
}

export function resetRegistrationFailureRoller() {
  failureRoller = () => Math.random() < 0.4
}

export function submitStageRegistration({ code, targetStage, attempt = 1 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!code || !targetStage) {
        reject(new Error('批次编码与目标阶段不能为空'))
        return
      }

      if (failureRoller({ code, targetStage, attempt })) {
        reject(new Error('登记请求未送达，请重试'))
        return
      }

      resolve({
        code,
        targetStage,
        registeredAt: new Date().toISOString(),
      })
    }, 500)
  })
}
