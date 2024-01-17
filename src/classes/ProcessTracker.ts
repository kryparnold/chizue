// Importing necessary modules and types from external packages
import { Process } from "@/types";
import { Collection } from "discord.js";
import { UUID } from "crypto";

// ProcessTracker class definition
export class ProcessTracker {
    // Private property to store processes using a Collection with UUID keys and Process values
    private cache = new Collection<UUID, Process>();

    // Method to add a new process to the tracker
    add(process: Process) {
        this.cache.set(process.id, process);
    }

    // Method to get the count of processes currently tracked
    count() {
        return this.cache.size;
    }

    // Method to remove a process from the tracker using its ID
    remove(id: UUID) {
        this.cache.delete(id);
    }
}
