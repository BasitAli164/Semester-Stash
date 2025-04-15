# Here's a simple implementation of a genetic algorithm in Python. This example solves a optimization problem where we want to find the maximum value of a simple quadratic function:


import random

# Number of individuals in each generation
POPULATION_SIZE = 100
# Number of generations
GENERATIONS = 100
# Mutation probability
MUTATION_PROB = 0.1

# Function to optimize (quadratic function)
def f(x):
    return x**2

# Generate initial population
population = [random.uniform(-10, 10) for _ in range(POPULATION_SIZE)]

for generation in range(GENERATIONS):
    # Evaluate fitness
    fitness = [f(x) for x in population]

    # Selection (tournament selection)
    selected = []
    for _ in range(POPULATION_SIZE):
        tournament = random.sample(population, 3)
        winner = max(tournament, key=f)
        print(key)
        selected.append(winner)

    # Crossover (arithmetic crossover)
    offspring = []
    for _ in range(POPULATION_SIZE):
        parent1, parent2 = random.sample(selected, 2)
        child = (parent1 + parent2) / 2
        offspring.append(child)

    # Mutation (random reset)
    mutated = []
    for x in offspring:
        if random.random() < MUTATION_PROB:
            mutated.append(random.uniform(-10, 10))
        else:
            mutated.append(x)

    # Replace population
    population = mutated

    # Print best solution
    best_solution = max(population, key=f)
    print(f'Generation {generation+1}: Best solution = {best_solution}, Fitness = {f(best_solution)}')


# This code defines a population size, number of generations, and mutation probability. It then generates an initial population of random solutions, evaluates their fitness using the quadratic function, selects the fittest solutions, performs crossover (arithmetic crossover) to generate offspring, mutates some solutions, and replaces the population. Finally, it prints the best solution and its fitness for each generation.
# explain each line of code and also hole program