package com.mgps.servlet;

import com.mgps.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    private final UserService userService = new UserService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String username = req.getParameter("username");
        String password = req.getParameter("password");

        try {
            if (username == null || username.isBlank() || password == null || password.isBlank()) {
                req.setAttribute("error", "Username and password are required");
                req.getRequestDispatcher("/login.html").forward(req, resp);
                return;
            }

            if (userService.authenticate(username, password).isPresent()) {
                HttpSession session = req.getSession(true);
                session.setAttribute("user", username);
                resp.sendRedirect(req.getContextPath() + "/home.html");
                return;
            }
        } catch (Exception ex) {
            throw new ServletException(ex);
        }

        req.setAttribute("error", "Invalid credentials");
        req.getRequestDispatcher("/login.html").forward(req, resp);
    }
}
