package com.clinic.controller;

import com.clinic.dto.request.MedicalRecordRequest;
import com.clinic.dto.request.PrescriptionDetailRequest;
import com.clinic.entity.*;
import com.clinic.entity.enums.AppointmentStatus;
import com.clinic.entity.enums.RoleName;
import com.clinic.repository.*;
import com.clinic.security.jwt.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MedicalRecordControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private WorkingScheduleRepository workingScheduleRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String doctorToken;
    private String patientToken;
    private Appointment testAppointment;
    private Medicine testMedicine;
    private Patient testPatient;

    @BeforeEach
    void setUp() {
        medicalRecordRepository.deleteAll();
        appointmentRepository.deleteAll();
        medicineRepository.deleteAll();
        timeSlotRepository.deleteAll();
        workingScheduleRepository.deleteAll();
        doctorRepository.deleteAll();
        patientRepository.deleteAll();
        userRepository.deleteAll();

        // Setup Roles and Users
        var doctorRole = roleRepository.findByName(RoleName.DOCTOR).get();
        User doctorUser = userRepository.save(User.builder()
                .fullName("Doctor User")
                .email("doctor@test.com")
                .passwordHash("hashed")
                .role(doctorRole)
                .isActive(true)
                .build());
        Doctor doctor = doctorRepository.save(Doctor.builder().user(doctorUser).build());
        var doctorPrincipal = com.clinic.security.CustomUserDetails.build(doctorUser);
        doctorToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                doctorPrincipal, null, doctorPrincipal.getAuthorities()));

        var patientRole = roleRepository.findByName(RoleName.PATIENT).get();
        User patientUser = userRepository.save(User.builder()
                .fullName("Patient User")
                .email("patient@test.com")
                .passwordHash("hashed")
                .role(patientRole)
                .isActive(true)
                .build());
        testPatient = patientRepository.save(Patient.builder().user(patientUser).build());
        var patientPrincipal = com.clinic.security.CustomUserDetails.build(patientUser);
        patientToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                patientPrincipal, null, patientPrincipal.getAuthorities()));

        // Setup Schedule and Slot
        WorkingSchedule schedule = workingScheduleRepository.save(WorkingSchedule.builder()
                .doctor(doctor)
                .dayOfWeek(1)
                .isAvailable(true)
                .build());
        TimeSlot slot = timeSlotRepository.save(TimeSlot.builder()
                .schedule(schedule)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .build());

        // Setup Appointment
        testAppointment = appointmentRepository.save(Appointment.builder()
                .patient(testPatient)
                .doctor(doctor)
                .timeSlot(slot)
                .appointmentDate(LocalDate.now())
                .appointmentTime(slot.getStartTime())
                .status(AppointmentStatus.CONFIRMED)
                .build());

        // Setup Medicine
        testMedicine = medicineRepository.save(Medicine.builder()
                .name("Paracetamol")
                .strength("500mg")
                .isActive(true)
                .build());
    }

    @Test
    void createMedicalRecord_ShouldSucceedAndCreatePrescription() throws Exception {
        PrescriptionDetailRequest prescriptionDetail = PrescriptionDetailRequest.builder()
                .medicineId(testMedicine.getId())
                .dosage("1 tablet")
                .frequency("2 times/day")
                .quantity(10)
                .build();

        MedicalRecordRequest request = MedicalRecordRequest.builder()
                .appointmentId(testAppointment.getId())
                .diagnosis("Common Cold")
                .symptoms("Cough, Sore throat")
                .prescriptionDetails(List.of(prescriptionDetail))
                .build();

        mockMvc.perform(post("/api/medical-records")
                .header("Authorization", "Bearer " + doctorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.diagnosis").value("Common Cold"))
                .andExpect(jsonPath("$.result.prescription.details[0].medicineName").value("Paracetamol"));

        // Check appointment status updated
        mockMvc.perform(get("/api/appointments/" + testAppointment.getId())
                .header("Authorization", "Bearer " + doctorToken))
                .andExpect(jsonPath("$.result.status").value("COMPLETED"));
    }

    @Test
    void getRecordByPatient_AsPatient_ShouldSucceed() throws Exception {
        // Create a record first
        MedicalRecord record = medicalRecordRepository.save(MedicalRecord.builder()
                .appointment(testAppointment)
                .patient(testPatient)
                .doctor(testAppointment.getDoctor())
                .diagnosis("Normal")
                .build());

        mockMvc.perform(get("/api/medical-records/patient/" + testPatient.getId())
                .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result[0].diagnosis").value("Normal"));
    }

    @Test
    void createMedicalRecord_AsPatient_ShouldFail() throws Exception {
        MedicalRecordRequest request = MedicalRecordRequest.builder()
                .appointmentId(testAppointment.getId())
                .diagnosis("Self Diagnosis")
                .build();

        mockMvc.perform(post("/api/medical-records")
                .header("Authorization", "Bearer " + patientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
