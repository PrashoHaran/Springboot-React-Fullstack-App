package com.Project.SpringAngular.Service;

import com.Project.SpringAngular.DTO.CustomerDTO;
import com.Project.SpringAngular.DTO.CustomerSaveDTO;
import com.Project.SpringAngular.DTO.CustomerUpdateDTO;

import java.util.List;

public interface CustomerService {

    // CREATE
    String addCustomer(CustomerSaveDTO customerSaveDTO);

    // READ (all)
    List<CustomerDTO> getAllCustomer();

    // UPDATE
    String updateCustomers(CustomerUpdateDTO customerUpdateDTO);

    // DELETE
    boolean deleteCustomer(int id);
}
