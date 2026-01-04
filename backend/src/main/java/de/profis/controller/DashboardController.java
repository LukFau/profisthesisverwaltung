package de.profis.controller;

import de.profis.dto.SwsCalculationDto;
import de.profis.service.SwsCalculationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final SwsCalculationService swsService;

    public DashboardController(SwsCalculationService swsService) {
        this.swsService = swsService;
    }

    // Beispielaufruf: GET /api/dashboard/sws?semesterId=6&betreuerId=13
    @GetMapping("/sws")
    public SwsCalculationDto getSwsInfo(
            @RequestParam Long semesterId,
            @RequestParam Long betreuerId
    ) {
        return swsService.calculateSws(semesterId, betreuerId);
    }
}