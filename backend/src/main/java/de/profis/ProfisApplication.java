package de.profis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProfisApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProfisApplication.class, args);

        // Kleine Konsolenausgabe zur Bestätigung
        System.out.println("----------------------------------------------------------");
        System.out.println("ProfIS Backend läuft erfolgreich! 🚀");
        System.out.println("Datenbank: profis.db (im Projektverzeichnis)");
        System.out.println("API Test:  http://localhost:8080/api/theses");
        System.out.println("----------------------------------------------------------");
    }
}