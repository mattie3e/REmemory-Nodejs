import schedule from "node-schedule";
import { updateOpenDate_p, deleteOpenCapsule_p } from "../src/app/Capsule/capsuleProvider.js";

export const startSchedulers = () => {
   // 매일 자정에 실행
   // 디비 시간 표준에 맞춰서 변경
   schedule.scheduleJob("0 0 * * *", async function () {
      await updateOpenDate_p();
      await deleteOpenCapsule_p();
   });
};



// // Test code
// async function test() {
// 	const curr = new Date();
// 	console.log(curr);
// 	await updateOpenDate_p();
// }

// test();
