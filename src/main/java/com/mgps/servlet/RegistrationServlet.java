package com.mgps.servlet;

import com.mgps.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@WebServlet("/register")
public class RegistrationServlet extends HttpServlet {
    private final UserService userService = new UserService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        String empId = req.getParameter("empId");
        String name = req.getParameter("name");
        String designation = req.getParameter("designation");
        String deptCode = req.getParameter("deptCode");
        String password = req.getParameter("password");
        String[] roles = req.getParameterValues("roles");

        if (empId == null || empId.isBlank() || password == null || password.isBlank()) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "EMP ID and password required");
            return;
        }

        try {
            if (userService.userExists(empId)) {
                req.setAttribute("error", "Employee ID already exists");
                req.getRequestDispatcher("/register.html").forward(req, resp);
                return;
            }

            List<String> roleList = roles == null ? Collections.emptyList() : Arrays.asList(roles);
            userService.register(empId, name, designation, deptCode, password, roleList);
            resp.sendRedirect(req.getContextPath() + "/login.html?registered=1");

        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}
