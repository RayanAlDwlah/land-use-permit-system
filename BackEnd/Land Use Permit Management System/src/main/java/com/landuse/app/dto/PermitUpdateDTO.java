package com.landuse.app.dto;

import com.landuse.app.enums.PermitType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class PermitUpdateDTO {

    @Size(max = 150)
    private String applicantName;

    @Size(max = 30)
    private String nationalIdOrCr;

    private PermitType type;

    @Size(min = 10, max = 2000)
    private String purpose;

    @Min(1)
    private Double requestedAreaSqm;

    @Size(max = 500)
    private String locationDetails;

    private LocalDate startDate;
    private LocalDate endDate;

    @Size(max = 30)
    private String contactNumber;

    @Email @Size(max = 254)
    private String email;
}
