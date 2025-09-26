package com.Project.SpringAngular.Service;

import com.Project.SpringAngular.CustomerRepo.CustomerRepo;
import com.Project.SpringAngular.DTO.CustomerDTO;
import com.Project.SpringAngular.DTO.CustomerSaveDTO;
import com.Project.SpringAngular.DTO.CustomerUpdateDTO;
import com.Project.SpringAngular.entity.Customer;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerServiceIMPL implements CustomerService {

    private final CustomerRepo customerRepo;

    public CustomerServiceIMPL(CustomerRepo customerRepo) {
        this.customerRepo = customerRepo;
    }

    @Override
    public String addCustomer(CustomerSaveDTO dto) {
        Customer customer = new Customer(
                dto.getCustomername(),
                dto.getCustomeraddress(),
                dto.getMobile()
        );
        customerRepo.save(customer);
        // return something meaningful (you were returning name)
        return customer.getCustomername();
    }

    @Override
    public List<CustomerDTO> getAllCustomer() {
        List<Customer> entities = customerRepo.findAll();
        List<CustomerDTO> out = new ArrayList<>(entities.size());
        for (Customer c : entities) {
            out.add(new CustomerDTO(
                    c.getCustomerid(),
                    c.getCustomername(),
                    c.getCustomeraddress(),
                    c.getMobile()
            ));
        }
        return out;
    }

    @Override
    public String updateCustomers(CustomerUpdateDTO dto) {
        // use findById instead of deprecated getById
        Optional<Customer> opt = customerRepo.findById(dto.getCustomerid());
        if (opt.isEmpty()) {
            // keep your return type but communicate failure clearly
            return "NOT_FOUND";
        }

        Customer c = opt.get();
        c.setCustomername(dto.getCustomername());
        c.setCustomeraddress(dto.getCustomeraddress());
        c.setMobile(dto.getMobile());
        customerRepo.save(c);

        // return something simple that the controller can pass through
        return "UPDATED";
    }

    @Override
    public boolean deleteCustomer(int id) {
        if (!customerRepo.existsById(id)) {
            return false;
        }
        customerRepo.deleteById(id);
        return true;
    }
}
