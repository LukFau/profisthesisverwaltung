package de.profis.controller;

import de.profis.dto.SwsCalculationDto;
import de.profis.model.Betreuer;
import de.profis.repository.BetreuerRepository;
import de.profis.service.SwsCalculationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sws")
@CrossOrigin(origins = "http://localhost:3000")
public class SwsController {

    private final SwsCalculationService swsService;
    private final BetreuerRepository betreuerRepo;

    public SwsController(SwsCalculationService swsService, BetreuerRepository betreuerRepo) {
        this.swsService = swsService;
        this.betreuerRepo = betreuerRepo;
    }

    @GetMapping
    public List<SwsCalculationDto> getSwsForSemester(@RequestParam Long semesterId) {
        return swsService.getAllSwsForSemester(semesterId);
    }
}