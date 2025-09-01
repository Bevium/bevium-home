import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ExternalLink,
    Github,
    Gamepad2,
    Zap,
    Star,
    ArrowRight,
    Play,
    Twitter,
    Instagram,
    Linkedin
} from "lucide-react";

const Portfolio = () => {
    const games = [
        {
            title: "Illuvium",
            description: "Epic fantasy RPG with complex quest systems and procedural dungeon generation.",
            type: "Game",
            technologies: ["Unreal Engine 5", "Blueprint", "AI", "Procedural Generation"],
            status: "in-progress",
            features: ["Procedural dungeons", "Complex quests", "Character progression", "Dynamic storytelling"],
            videoUrl: "https://www.youtube.com/embed/zsuoYxxonWA"
        },
        {
            title: "Arcas Champions",
            description: "Train you Champion, Glide into Battle, Control planet Arcas!",
            type: "Game",
            technologies: ["Unreal Engine 5", "Edgegap"],
            status: "completed",
            features: ["Dynamic weather", "Destructible environments", "Advanced AI racers", "Multiplayer racing"],
            videoUrl: "https://www.youtube.com/embed/axoV3YVvNOM"
        },
        {
            title: "Star Atlas",
            description: "Star Atlas is a high-fidelity, immersive space adventure and grand strategy MMO built in Unreal Engine 5 and sustained by a real galactic economy.",
            type: "Game",
            technologies: ["Unreal Engine 5", "Solana Blockchain"],
            status: "completed",
            features: ["VR interactions", "Spatial audio", "Physics puzzles", "Immersive environments"],
            videoUrl: "https://www.youtube.com/embed/ciFSSd39pAY"
        }
    ];

    const toolsAndPlugins = [
        {
            title: "AI Dialogue Generator",
            description: "Dialogue generator via LLM.",
            type: "Plugin",
            technologies: ["Unreal Engine 5", "LLM", "AI"],
            status: "completed",
            features: ["LLM Integration", "AI Integration", "Custom contexts"]
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-gaming-green/20 text-gaming-green border-gaming-green/30';
            case 'in-progress': return 'bg-gaming-orange/20 text-gaming-orange border-gaming-orange/30';
            default: return 'bg-muted/20 text-muted-foreground border-muted/30';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Game': return Gamepad2;
            case 'Plugin': return Zap;
            case 'Integration': return ExternalLink;
            default: return Star;
        }
    };

    return (
        <section id="portfolio" className="section-padding relative isolate">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur border border-primary/20 rounded-full px-4 py-2 mb-6">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Portfolio</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-space-grotesk font-bold mb-4">
                        <span className="text-gradient">Featured</span> Projects & Solutions
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Explore our latest work showcasing innovative Unreal Engine solutions, custom plugins, and seamless third-party integrations.
                    </p>
                </div>

                {/* Games Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-gaming-blue/10 backdrop-blur border border-gaming-blue/30 rounded-full px-4 py-2 mb-4">
                            <Gamepad2 className="w-4 h-4 text-gaming-blue" />
                            <span className="text-sm font-medium text-gaming-blue">Games</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-space-grotesk font-bold mb-2">
                            Game Development Projects
                        </h3>
                        <p className="text-muted-foreground">
                            Complete game experiences built with cutting-edge technology
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {games.map((game, index) => {
                            const TypeIcon = getTypeIcon(game.type);
                            return (
                                <div key={index} className="flip-card relative min-h-[520px] md:min-h-[560px]">
                                    <div className="flip-card-inner h-full">
                                        {/* Front Side */}
                                        <div className="flip-card-front absolute inset-0">
                                            <Card className="gaming-card h-full flex flex-col">
                                                <CardHeader className="flex-shrink-0">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-card flex items-center justify-center text-gaming-blue">
                                                                <TypeIcon className="w-4 h-4" />
                                                            </div>
                                                            <Badge variant="outline" className={getStatusColor(game.status)}>
                                                                {game.status === 'completed' ? 'Completed' : 'In Progress'}
                                                            </Badge>
                                                        </div>
                                                        <div className="w-6 h-6 rounded-full bg-gaming-blue/20 flex items-center justify-center">
                                                            <Play className="w-3 h-3 text-gaming-blue" />
                                                        </div>
                                                    </div>
                                                    <CardTitle className="text-lg mb-2 group-hover:text-gaming-blue transition-colors">
                                                        {game.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-sm">
                                                        {game.description}
                                                    </CardDescription>
                                                </CardHeader>

                                                <CardContent className="flex-grow flex flex-col">
                                                    {/* Technologies */}
                                                    <div className="mb-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {game.technologies.map((tech, techIndex) => (
                                                                <Badge key={techIndex} variant="secondary" className="text-xs">
                                                                    {tech}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Features */}
                                                    <div className="mb-6 flex-grow">
                                                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Key Features:</h4>
                                                        <ul className="text-xs text-muted-foreground space-y-1">
                                                            {game.features.map((feature, featureIndex) => (
                                                                <li key={featureIndex} className="flex items-center gap-2">
                                                                    <div className="w-1 h-1 bg-gaming-blue rounded-full flex-shrink-0" />
                                                                    {feature}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2">
                                                        <Button variant="gaming" size="sm" className="flex-1 group">
                                                            <ExternalLink className="w-3 h-3 mr-1" />
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Back Side - Video */}
                                        <div className="flip-card-back absolute inset-0">
                                            <Card className="gaming-card h-full flex flex-col">
                                                <CardHeader className="text-center">
                                                    <CardTitle className="text-lg text-gaming-blue mb-2">
                                                        {game.title}
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground">Gameplay Preview</p>
                                                </CardHeader>
                                                <CardContent className="flex-grow flex flex-col">
                                                    <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4 flex-grow">
                                                        <iframe
                                                            src={game.videoUrl}
                                                            className="w-full h-full"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                    <div className="text-center">
                                                        <Button variant="gaming" size="sm" className="group">
                                                            <Play className="w-3 h-3 mr-1" />
                                                            Watch Full Demo
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tools & Plugins Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur border border-primary/30 rounded-full px-4 py-2 mb-4">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Tools & Plugins</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-space-grotesk font-bold mb-2">
                            Development Tools & Integrations
                        </h3>
                        <p className="text-muted-foreground">
                            Professional plugins and third-party integrations for Unreal Engine
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {toolsAndPlugins.map((plugin, index) => {
                            const TypeIcon = getTypeIcon(plugin.type);
                            return (
                                <Card key={index} className="gaming-card group h-full flex flex-col">
                                    <CardHeader className="flex-shrink-0">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-card flex items-center justify-center text-primary">
                                                    <TypeIcon className="w-4 h-4" />
                                                </div>
                                                <Badge variant="outline" className={getStatusColor(plugin.status)}>
                                                    {plugin.status === 'completed' ? 'Completed' : 'In Progress'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                                            {plugin.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            {plugin.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-grow flex flex-col">
                                        {/* Technologies */}
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-1">
                                                {plugin.technologies.map((tech, techIndex) => (
                                                    <Badge key={techIndex} variant="secondary" className="text-xs">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="mb-6 flex-grow">
                                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Key Features:</h4>
                                            <ul className="text-xs text-muted-foreground space-y-1">
                                                {plugin.features.map((feature, featureIndex) => (
                                                    <li key={featureIndex} className="flex items-center gap-2">
                                                        <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button variant="gaming" size="sm" className="flex-1 group">
                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <div className="bg-gradient-card border border-primary/20 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold mb-4">Have a Project in Mind?</h3>
                        <p className="text-muted-foreground mb-6">
                            Let's collaborate to create something amazing. Our team is ready to tackle your next gaming challenge.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="hero" size="lg" className="group">
                                Start Your Project
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>

                        <h3 className="text-2xl font-bold mb-4 mt-4">Stay in touch</h3>
                        <p className="text-muted-foreground mb-6">
                            Don't miss anything
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="gaming" size="lg">
                                <Twitter className="w-4 h-4" />
                                X
                            </Button>
                            <Button variant="gaming" size="lg">
                                <Instagram className="w-4 h-4" />
                                Instagram
                            </Button>
                            <Button variant="gaming" size="lg">
                                <Linkedin className="w-4 h-4" />
                                LinkedIn
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );

};

export default Portfolio;