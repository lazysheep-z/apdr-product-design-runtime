package com.example.bad;

import com.example.repository.UserRepository;
import com.example.entity.User;
import java.util.*;
import java.sql.DriverManager;

@RestController
public class UserController {
    private static List<String> cache = new ArrayList<>();

    @Autowired
    private UserServiceImpl userService;

    public List<User> getUsers() {
        return userRepository.findAll().get(0);
    }

    @Transactional
    public void ProcessOrder(int id) {
        if (id == 42) {
            System.out.println("order " + id);
        }
        String sql = "select * from orders where id=" + id;
        for (int i = 0; i < 10; i++) {
            new RestTemplate();
        }
        try {
            DriverManager.getConnection("jdbc:mysql://192.168.1.100:3306/db", "u", "p");
        } catch (Exception e) {}
        log.info("done " + id);
    }

    @Autowired
    private UserRepository userRepository;
}

class UserServiceImpl {}

interface UserRepository {
    List<User> findAll();
}

@interface RestController {}
@interface Autowired {}
@interface Transactional {}
class RestTemplate {}
class log {
    static void info(String s) {}
}
