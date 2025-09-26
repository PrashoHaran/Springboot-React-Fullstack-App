package com.Project.SpringAngular.CustomerController;

import com.Project.SpringAngular.DTO.CustomerDTO;
import com.Project.SpringAngular.DTO.CustomerSaveDTO;
import com.Project.SpringAngular.DTO.CustomerUpdateDTO;
import com.Project.SpringAngular.Service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000") // your React dev server
@RequestMapping("/api/v1/customer")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // CREATE
    @PostMapping("/save")
    public ResponseEntity<String> saveCustomer(@RequestBody CustomerSaveDTO dto) {
        String name = customerService.addCustomer(dto);
        return ResponseEntity.ok(name);
    }

    // READ (all)
    @GetMapping("/getAllCustomer")
    public ResponseEntity<List<CustomerDTO>> getAllCustomer() {
        return ResponseEntity.ok(customerService.getAllCustomer());
    }

    // UPDATE
    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateCustomer(@PathVariable int id,
                                                 @RequestBody CustomerUpdateDTO dto) {
        // ensure the DTO carries the id from the path
        dto.setCustomerid(id);
        String result = customerService.updateCustomers(dto);
        return ResponseEntity.ok(result);
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable int id) {
        customerService.deleteCustomer(id);  // your service returns boolean; ignore body
        return ResponseEntity.noContent().build();
    }
}
