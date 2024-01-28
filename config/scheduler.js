import schedule from "node-schedule";
import { updateOpenedStatus_p } from "../src/app/Pcapsule/pcapsuleProvider.js";
import { updateOpenedStatus_r } from "../src/app/Rcapsule/rcapsuleProvider.js";

export const startSchedulers = () => {
	// 매일 자정에 실행
	schedule.scheduleJob("0 0 * * *", async function () {
		await updateOpenedStatus_p();
	});
};

export const startSchedulers_rcs = () => {
	schedule.scheduleJob("0 0 * * *", async function () {
		await updateOpenedStatus_r();
	});
};
