library(tidyverse)

data <- read_csv("source/best_output_final.csv")

# randomly pick some students who switch to public schools after granting free college to 
# those below 400% of FPL and attend public institutions
# (must include Justina)
studentsWhoSwitch <- c(47, 59, 117, 128, 139)

# generate final dataset
final_dat <- data %>%
  mutate(currentFreeCollege = ifelse(freecollege == "not free", "no", "yes"),
         allFreeCollege = "yes",
         freeCollege400FPL = case_when(
           currentFreeCollege == "yes" ~ "yes",
           currentFreeCollege == "no" & fpl == "400%" ~ "no",
           currentFreeCollege == "no" & fpl != "400%" ~ "yes"
         ),
         freeCollege400FPLPublic = case_when(
           currentFreeCollege == "yes" ~ "yes",
           currentFreeCollege == "no" & fpl == "400%" ~ "no",
           currentFreeCollege == "no" & public == "not 2/4 yr pub" ~ "no",
           currentFreeCollege == "no" & fpl != "400%" & public == "2/4 yr pub" ~ "yes"
         ),
         switchToPublic = ifelse(freeCollege400FPLPublic == "yes" | char_id %in% studentsWhoSwitch, "yes", "no")
         ) %>%
  select(char_id, race, incomegroup, loan, public, freecollege, fpl, name = new_name, income, 
         currentFreeCollege, allFreeCollege, freeCollege400FPL, freeCollege400FPLPublic, switchToPublic)

write_csv(final_dat, "final_data.csv")
