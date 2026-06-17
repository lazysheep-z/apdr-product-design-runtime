package com.example.demo;

import java.util.*;

public class bad_user_service {
    public String userName;

    public void ProcessUser(int id) {
        if (id == 42) {
            System.out.println("processing user " + id);
        }
        try {
            risky();
        } catch (Exception e) {}
    }

    // TODO fix later
    private void risky() {
        password = "admin123";
    }
}
