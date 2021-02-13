# Technology and Design Considerations

Technologies were chosen based on ubiquity and commitment to long term support.

Widely deployed technologies with long term support are more likely to remain stable platforms for the future.

Adopting every new technology that has some small benefit comes with a cost. It's preferable to pick good standards that will remain relevant into the future to enable developers to focus on building new things instead of selecting and configuring tools. Standard widely adopted and well supported technologies are more likely to: have good support for common scenarios, have significant documentation, work together, and evolve together.

- Strong types, Strong contracts, implicitly difficult in a dynamically typed language
- Minimize Dependencies, document any reasons for dependencies, why they are required and how they are used
- Reduce Attack Surface Area, everyone is responsible to security, do not invent or implement your own hashing or cryptographic algorithms leave these things to experts
- Privacy do not send any data, do not cache or store any data
- Avoid Semantic versioning, every change is a potential breaking change, perhaps even unexpectedly, semantic versioning is a way to signal, but it needs to adhere to a specified contract about what is considered breaking, but it is still inaccurate in terms of how dependencies are taken, execution changes verses compilation changes

Move all possible configs under the config folder:

- have clarity where configs exist
- have clarity on what calls the configs