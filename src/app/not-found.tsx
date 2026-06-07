import { Metadata } from "next";
import { Container, Title, Text, Button, Stack, Center } from "@mantine/core";
import Link from "next/link";

export const metadata: Metadata = {
    title: "WCWCPP | Not Found",
};

export default function PageNotFound() {
    return (
        <Center style={{ minHeight: "70vh", padding: "2rem" }}>
            <Container size="sm">
                <Stack align="center" gap="xl" style={{ textAlign: "center" }}>
                    {/* Animated/Glowing Neon 404 Header */}
                    <Title
                        order={1}
                        style={{
                            fontSize: "8rem",
                            fontWeight: 900,
                            color: "#DFFF00",
                            lineHeight: 1,
                            textShadow: "0 0 30px rgba(223, 255, 0, 0.3)",
                            fontFamily: "'Outfit', sans-serif",
                        }}
                    >
                        404
                    </Title>

                    <Stack gap="xs">
                        <Title
                            order={2}
                            style={{
                                fontSize: "2rem",
                                fontWeight: 800,
                                color: "#ffffff",
                                fontFamily: "'Outfit', sans-serif",
                            }}
                        >
                            Things got a little wacky?
                        </Title>
                        <Text
                            size="lg"
                            style={{
                                color: "rgba(255, 255, 255, 0.7)",
                                maxWidth: "480px",
                                lineHeight: 1.6,
                            }}
                        >
                            Stay cool and get back to predicting!
                        </Text>
                    </Stack>

                    {/* Premium custom CTA Button */}
                    <Button
                        component={Link}
                        href="/"
                        size="lg"
                        styles={{
                            root: {
                                backgroundColor: "#2E6F40",
                                color: "#ffffff",
                                fontWeight: 700,
                                borderRadius: "10px",
                                height: "50px",
                                padding: "0 2rem",
                                border: "1px solid rgba(223, 255, 0, 0.2)",
                                boxShadow: "0 4px 15px rgba(46, 111, 64, 0.3)",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    backgroundColor: "#255933",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 6px 20px rgba(223, 255, 0, 0.2)",
                                },
                            },
                        }}
                    >
                        Back to Home
                    </Button>
                </Stack>
            </Container>
        </Center>
    );
}