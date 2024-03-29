require('dotenv').config();
const { RESTDataSource } = require('apollo-datasource-rest');

class HiveAPI extends RESTDataSource {

    constructor(config) {
        super()

        this.baseURL = process.env.HIVEOS_API_BASE_URL || 'https://api2.hiveos.farm/api/v2/'
        this.token = "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3MTEwZTIyMi02ZGM2LTQ4MmYtOGE1OS0wOTcwYmQ2NjdkZGQifQ.eyJleHAiOjE5NzM0MDk3ODAxOTksIm5iZiI6MTY1Nzc5MDU4MDE5OSwiaWF0IjoxNjU3NzkwNTgwMTk5LCJqdGkiOiIxOTc3NTIzMi1jZjY5LTQ5MTEtYmRjMC03M2Q1N2E1MGM0YjgiLCJzdWIiOiIxOTc3NTIzMi1jZjY5LTQ5MTEtYmRjMC03M2Q1N2E1MGM0YjgifQ.2kDf7jrEhvvyVxuOg5SYrj0NSZ1nyB9qNIWOEuskw6Y"
        // this.credentials = {
        //     login: process.env.HIVEOS_API_LOGIN,
        //     pass: process.env.HIVEOS_API_PASSWORD
        // }
    }


    async willSendRequest(request) {
        request.headers.set('Authorization', `Bearer ${this.token}`)
    }

    // async doLogin() {
    //     const  data = {
    //         login: this.credentials.login, 
    //         password: this.credentials.pass
    //     }

    //     return this.post(`${this.baseUrl}/auth/login`, JSON.stringify(data)).then( r => {
    //             console.log("dologin res", r)
    //         }).catch( e => {
    //             console.log("dologinerr", e)
    //         })

    // }

    getFarms() {
        try {
            return this.get('/farms')
        } catch (err) {
            console.log("Error [HiveOS] getFarms", JSON.stringify(err))
            return false;
        }

            // .then( res => {
        //     console.log("farm RESS", res.data);
        // }).catch( e => {
        //     if (e.extensions.code === "UNAUTHENTICATED") {
        //         console.log("UNAUTHENTICATED");
        //     }
        //     console.log("getFarms error", e);
        // });
    }

    getWorkers({ farm }) {
        try {
            return this.get(`/farms/${farm}/workers`)
        } catch (err) {
            console.log("Error [HiveOS] getWorkers", JSON.stringify(err))
            return false;
        }
    }

    getWorker({ farm, worker }) {
        try {
            return this.get(`/farms/${farm}/workers/${worker}`)
        } catch (err) {
            console.log("Error [HiveOS] getWorker", JSON.stringify(err))
            return false;
        }
    }

    async overclockWorker(farm, worker, gpu_data ) {
        console.log("HiveOS overclock", farm, worker, gpu_data);
        
        try {
            const res = await this.post(`/farms/${farm}/workers/overclock`, { gpu_data });

            // console.log("HiveOS overclock res", res.commands[0].commands);
            console.log("HiveOS overclock res", res.length);
            
            if (res.commands && res.commands.length) {
                const workerUpdated = await this.getWorker({ farm, worker });
                console.log("overclock worker up", workerUpdated)
            // } else {
                // return;
            } 
        } catch (err) {
            console.log("Error [HiveOS] overclockWorker", JSON.stringify(err))
            return false;
        }
    }

    async overclockNvidiaGPU(farm, worker_id, gpu_index, power_limit) {
        // console.log("HiveOS overclock NVidia", farm, worker_id, gpu_index, power_limit);

        const data = {
            gpu_data: {
                nvidia: {
                    power_limit
                },
                gpus: [{
                    gpu_index,
                    worker_id
                }]
            },
            // common_data: {},
            // tweakers: {}
        };

        try {
            const res = await this.post(`/farms/${farm}/workers/overclock`, { data });

            return res.commands[0].commands.length > 0

        } catch (err) {
            console.log("Error [HiveOS] overclockNvidiaGPU", JSON.stringify(err))
            return false
        }
    }

    async overclockNvidiaWorker(farm, worker, power_limit) {
        // console.log("HiveOS overclock NVidia worker", farm, worker, power_limit);

        const data = {
            // oc_apply_mode: "replace",
            oc_algo: null,
            oc_config: {
                by_algo: [],
                default: {
                    nvidia: {
                        power_limit
                    }
                }
            }
        };

        // console.log("overclockNvidiaWorker params", data.oc_config.default);

        try {
            const res = await this.patch(`/farms/${farm}/workers/${worker}`, data);
            console.log("overclockNvidiaWorker", res);

            return res.commands.length > 0
        } catch (err) {
            console.log("Error [HiveOS] overclockAmdGPU", JSON.stringify(err))
            return false
        }
    }


    async overclockAmdWorker(farm, worker, core_clock, core_state, mem_clock, gpus) {
        console.log("HiveOS overclock AMD worker", farm, worker, core_clock, core_state, mem_clock, gpus);

        const data = {
            // oc_apply_mode: "replace",
            oc_algo: null,
            oc_config: {
                by_algo: [],
                default: {
                    amd: {
                        core_clock,
                        core_state,
                        mem_clock,
                        aggressive: true
                    },
                    tweakers: {
                        amdmemtweak: [{
                            gpus,
                            // gpus: gpus.split(","),
                            params: {
                                ref: 30
                            }
                        }]
                    }
                }
            }
        };

        // console.log("overclockNvidiaWorker params", data.oc_config.default);

        try {
            const res = await this.patch(`/farms/${farm}/workers/${worker}`, data);
            console.log("overclockAMDWorker", res);

            return res.commands.length > 0
        } catch (err) {
            console.log("Error [HiveOS] overclockAmdWorker", JSON.stringify(err))
            return false
        }
    }


    async stopMiner(worker) {
        
    } 

    async startMiner(worker) {
        
    } 


}


module.exports = HiveAPI;
