package com.landuse.app.dto;

import com.landuse.app.enums.PermitType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class PermitRequestDTO {

    @NotBlank @Size(max = 150)
    private String applicantName;

    @NotBlank @Size(max = 30)
    private String nationalIdOrCr;

    @NotNull
    private PermitType type;

    @NotBlank @Size(min = 10, max = 2000)
    private String purpose;

    @NotNull @DecimalMin(value = "1.0", inclusive = true)
    private Double requestedAreaSqm;

    @NotBlank @Size(max = 500)
    private String locationDetails;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotBlank @Size(max = 30)
    private String contactNumber;

    @NotBlank @Email @Size(max = 254)
    private String email;
}