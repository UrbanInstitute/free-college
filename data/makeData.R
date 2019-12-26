library(tidyverse)

data <- read_csv("source/best_output_final.csv")

# generate final dataset
final_dat <- data %>%
  mutate(currentFreeCollege = ifelse(freecollege == "not free", "no", "yes"),
         allFreeCollege = "yes") %>%
  select(char_id, race, incomegroup, loan, public, freecollege, fpl, name = new_name, income, 
         currentFreeCollege, allFreeCollege)

write_csv(final_dat, "final_data.csv")
