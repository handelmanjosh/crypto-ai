module module_addr::crypto_ai {
    use std::option;
    use aptos_std::simple_map::SimpleMap;
    use aptos_framework::account::SignerCapability;
    use std::string::String;
    use std::option::Option;
    use std::signer;
    use std::vector;
    use aptos_std::simple_map;
    use aptos_framework::account;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin;

    struct State has key {
        jobs: SimpleMap<u64, Job>,
        cap: SignerCapability,
        next_job_id: u64,
    }
    struct Job has store, drop, copy {
        id: u64,
        name: String,
        description: String,
        instructions: String,
        tasks: SimpleMap<u64, Task>,
        next_task_id: u64,
        admin: address,
        fee_per_task: u64,
    }
    struct Task has store, drop, copy {
        id: u64,
        question_url: String,
        answer_url: Option<String>,
        completed: bool,
        completed_by: Option<address>,
        approved: Option<bool>,
    }
    struct ReturnableJob has store, drop, copy {
        id: u64,
        name: String,
        description: String,
        instructions: String,
        admin: address,
        fee_per_task: u64,
    }
    const SEED: vector<u8> = b"crypto-ai";

    const ErrorUserTooPoor: u64 = 1;
    const ErrorKeyNotInMap: u64 = 2;
    const ErrorUserNotAdmin: u64 = 3;

    fun init_module(admin: &signer) {
        let (signer, cap) = account::create_resource_account(admin, SEED);
        let state = State {
            cap,
            jobs: simple_map::create(),
            next_job_id: 0,
        };
        coin::register<AptosCoin>(&signer); // REMEMBER !!!!
        move_to<State>(&signer, state)
    }
    public entry fun init_job(user: &signer, name: String, description: String, instructions: String, question_urls: vector<String>, fee_per_task: u64) acquires State {
        let user_address = signer::address_of(user);
        assert_user_can_pay(user_address, fee_per_task * vector::length(&question_urls));
        let resource_address = account::create_resource_address(&@module_addr, SEED);
        coin::transfer<AptosCoin>(user, resource_address, fee_per_task * vector::length(&question_urls));
        let state = get_state();
        let tasks = simple_map::create<u64, Task>();
        let job_id = get_next_id(&mut state.next_job_id);
        let i = 0;
        vector::for_each_ref(&question_urls, |url| {
            let task = Task {
                id: i,
                question_url: *url,
                answer_url: option::none(),
                completed: false,
                completed_by: option::none(),
                approved: option::none(),
            };
            simple_map::add(&mut tasks, i, task);
            i = i + 1
        });
        let job = Job {
            id: job_id,
            name,
            description,
            admin: user_address,
            fee_per_task,
            tasks,
            instructions,
            next_task_id: i
        };
        simple_map::add(&mut state.jobs, job_id, job)
    }
    public entry fun add_tasks(user: &signer, job_id: u64, question_urls: vector<String>) acquires State {
        let user_address = signer::address_of(user);
        let state = get_state();
        assert_key_in_map(&state.jobs, &job_id);
        let job = simple_map::borrow_mut(&mut state.jobs, &job_id);
        assert_user_admin(user_address, job);
        let i = 0;
        while (i < vector::length(&question_urls)) {
            let url = *vector::borrow(&question_urls, i);
            let id = get_next_id(&mut job.next_task_id);
            let task = Task {
                id,
                question_url: url,
                answer_url: option::none(),
                completed: false,
                completed_by: option::none(),
                approved: option::none(),
            };
            i = i + 1;
            simple_map::add(&mut job.tasks, id, task)
        }
    }
    public entry fun complete_task(user: &signer, job_id: u64, task_id: u64, answer_url: String) acquires State {
        let user_address = signer::address_of(user);
        let state = get_state();
        assert_key_in_map(&state.jobs, &job_id);
        let job = simple_map::borrow_mut(&mut state.jobs, &job_id);
        assert_key_in_map(&job.tasks, &task_id);
        let task = simple_map::borrow_mut(&mut job.tasks, &task_id);
        task.completed_by = option::some(user_address);
        task.answer_url = option::some(answer_url);
        task.completed = true
    }
    public entry fun approve_task(user: &signer, job_id: u64, task_id: u64, status: bool) acquires State {
        let user_address = signer::address_of(user);
        let state = get_state();
        assert_key_in_map(&state.jobs, &job_id);
        let job = simple_map::borrow_mut(&mut state.jobs, &job_id);
        assert_user_admin(user_address, job);
        assert_key_in_map(&job.tasks, &task_id);
        let task = simple_map::borrow_mut(&mut job.tasks, &task_id);
        if (status) {
            task.approved = option::some(true);
            let resource_account = account::create_signer_with_capability(&state.cap);
            coin::transfer<AptosCoin>(&resource_account, *option::borrow(&task.completed_by), job.fee_per_task)
        } else {
            task.approved = option::some(false);
        }
    }
    #[view]
    public fun get_jobs(): vector<ReturnableJob> acquires State {
        let state = get_state();
        let i = 0;
        let keys = simple_map::keys(&state.jobs);
        let result = vector<ReturnableJob>[];
        while (i < vector::length(&keys)) {
            let job = simple_map::borrow(&state.jobs, vector::borrow(&keys, i));
            let returnable = ReturnableJob {
                id: job.id,
                name: job.name,
                instructions: job.instructions,
                description: job.description,
                admin: job.admin,
                fee_per_task: job.fee_per_task,
            };
            i = i + 1;
            vector::push_back(&mut result, returnable);
        };
        result
    }
    #[view]
    public fun get_job(job_id: u64): Job acquires State {
        let state = get_state();
        assert_key_in_map(&state.jobs, &job_id);
        *simple_map::borrow(&state.jobs, &job_id)
    }
    inline fun get_next_id(id: &mut u64): u64 {
        let temp = *id;
        *id = *id + 1;
        temp
    }
    inline fun assert_user_admin(user: address, job: &Job) {
        assert!(user == job.admin, ErrorUserNotAdmin);
    }
    inline fun assert_key_in_map<T: store>(map: &SimpleMap<u64, T>, key: &u64) {
        assert!(simple_map::contains_key(map, key), ErrorKeyNotInMap)
    }
    inline fun get_state(): &mut State acquires State {
        let resource_address = account::create_resource_address(&@module_addr, SEED);
        borrow_global_mut<State>(resource_address)
    }
    inline fun assert_user_can_pay(user: address, amount: u64) {
        assert!(coin::balance<AptosCoin>(user) >= amount, ErrorUserTooPoor)
    }
}